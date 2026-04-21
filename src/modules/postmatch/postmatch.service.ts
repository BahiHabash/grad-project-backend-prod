import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadGatewayException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { PinoLogger } from 'nestjs-pino';
import { plainToInstance } from 'class-transformer';
import { validate, type ValidationError } from 'class-validator';

import { PostMatchReport } from './entities/postmatch-report.entity';
import { Club } from '../club/entities/club.entity';
import { AiModelClient } from './providers/ai-model.client';
import { LlmClient } from './providers/llm/llm.client';
import { AiAnalysisDto } from './dto/ai-analysis.dto';
import { ReportStatus } from './constants/report-status.enum';

interface ReportResult {
  report: PostMatchReport;
  cached: boolean;
}

interface PaginatedReports {
  reports: PostMatchReport[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Orchestrates the post-match analysis pipeline.
 *
 * Flow: Verify club → Verify team ownership → Check cache → Call AI → Validate → Call LLM → Store → Return
 *
 * Caching is team-based: one report per (event_id, team_id).
 * Access is club-based and team-scoped: users can only analyze their own team.
 */
@Injectable()
export class PostmatchService {
  constructor(
    @InjectRepository(PostMatchReport)
    private readonly reportRepo: Repository<PostMatchReport>,
    @InjectRepository(Club)
    private readonly clubRepo: Repository<Club>,
    private readonly aiClient: AiModelClient,
    private readonly llmClient: LlmClient,
    private readonly logger: PinoLogger,
  ) {}

  /**
   * Triggers a full post-match analysis for a given match and team.
   *
   * Returns a cached report if one already exists for the (eventId, teamId) pair,
   * otherwise runs the full AI → LLM → Store pipeline.
   *
   * @param eventId - SofaScore event/match ID.
   * @param teamId - SofaScore team ID.
   * @param userId - ID of the requesting user (audit trail).
   * @param clubId - Club ID from JWT (access control).
   * @returns The report and a flag indicating whether it was cached.
   * @throws ForbiddenException if user has no club, team ID mismatch, or club mismatch on cache hit.
   * @throws NotFoundException if the user's club does not exist in the database.
   * @throws BadGatewayException if AI service fails or returns invalid data.
   */
  async analyzeMatch(
    eventId: string,
    teamId: string,
    userId: string,
    clubId: string | null,
  ): Promise<ReportResult> {
    this.requireClub(clubId);

    const clubTeamId = await this.resolveClubTeamId(clubId);
    this.enforceTeamAccess(teamId, clubTeamId);

    const cached = await this.reportRepo.findOne({
      where: { event_id: eventId, team_id: teamId },
    });

    if (cached) {
      this.enforceClubAccess(cached.club_id, clubId!);
      this.logger.info(`Cache hit for event=${eventId}, team=${teamId}`);
      return { report: cached, cached: true };
    }

    this.logger.info(`Cache miss. Starting analysis pipeline...`);

    const rawData = await this.aiClient.analyze(eventId, teamId);
    await this.validateAiResponse(rawData);

    let llmExplanation: string | null = null;
    let llmModel: string | null = null;

    const llmResult = await this.llmClient.explain(rawData);
    if (llmResult) {
      llmExplanation = llmResult.text;
      llmModel = llmResult.model;
    }

    const status = llmExplanation
      ? ReportStatus.COMPLETED
      : ReportStatus.PARTIAL;
    const analysisTimestamp = this.extractAnalysisTimestamp(rawData);

    const report = this.reportRepo.create({
      event_id: eventId,
      team_id: teamId,
      club_id: clubId!,
      raw_analysis: rawData,
      llm_explanation: llmExplanation,
      llm_model: llmModel,
      status,
      requested_by_id: userId,
      analysis_timestamp: analysisTimestamp,
    });

    try {
      const saved = await this.reportRepo.save(report);
      this.logger.info(`Report saved: id=${saved.id}, status=${status}`);
      return { report: saved, cached: false };
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        this.logger.warn(
          `Duplicate report detected during save (event=${eventId}, team=${teamId}). Returning existing report.`,
        );

        const existing = await this.reportRepo.findOne({
          where: { event_id: eventId, team_id: teamId },
        });

        if (existing) {
          return { report: existing, cached: true };
        }
      }

      throw error;
    }
  }

  /**
   * Retrieves a single report by ID with club-based access control.
   *
   * @param reportId - UUID of the report.
   * @param clubId - Club ID from JWT (access control).
   * @returns The matching report.
   * @throws NotFoundException if the report does not exist.
   * @throws ForbiddenException if user has no club or club mismatch.
   */
  async getReport(
    reportId: string,
    clubId: string | null,
  ): Promise<PostMatchReport> {
    this.requireClub(clubId);

    const report = await this.reportRepo.findOne({
      where: { id: reportId },
    });

    if (!report) {
      throw new NotFoundException(`Report with id "${reportId}" not found.`);
    }

    this.enforceClubAccess(report.club_id, clubId!);

    return report;
  }

  /**
   * Returns a paginated list of reports belonging to the user's club.
   *
   * @param clubId - Club ID from JWT (access control + filter).
   * @param page - Page number (1-indexed).
   * @param limit - Number of items per page.
   * @returns Paginated reports with total count.
   * @throws ForbiddenException if user has no club.
   */
  async getReports(
    clubId: string | null,
    page: number,
    limit: number,
  ): Promise<PaginatedReports> {
    this.requireClub(clubId);

    const [reports, total] = await this.reportRepo.findAndCount({
      where: { club_id: clubId! },
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      select: [
        'id',
        'event_id',
        'team_id',
        'status',
        'analysis_timestamp',
        'created_at',
      ],
    });

    return { reports, total, page, limit };
  }

  /**
   * Retries the LLM explanation for a PARTIAL report.
   * Does NOT re-run the AI analysis — only generates the missing explanation.
   *
   * @param reportId - UUID of the report to retry.
   * @param clubId - Club ID from JWT (access control).
   * @returns The updated report with status COMPLETED.
   * @throws ForbiddenException if user has no club or club mismatch.
   * @throws NotFoundException if the report does not exist.
   * @throws ConflictException if the report is already COMPLETED.
   * @throws BadGatewayException if all LLM adapters fail.
   */
  async retryExplanation(
    reportId: string,
    clubId: string | null,
  ): Promise<PostMatchReport> {
    const report = await this.getReport(reportId, clubId);

    if (report.status === ReportStatus.COMPLETED) {
      throw new ConflictException(
        'This report already has a complete LLM explanation.',
      );
    }

    const llmResult = await this.llmClient.explain(report.raw_analysis);

    if (!llmResult) {
      throw new BadGatewayException(
        'LLM service is currently unavailable. Please try again later.',
      );
    }

    report.llm_explanation = llmResult.text;
    report.llm_model = llmResult.model;
    report.status = ReportStatus.COMPLETED;

    const updated = await this.reportRepo.save(report);
    this.logger.info(`Report ${reportId} explanation retried successfully.`);

    return updated;
  }

  /**
   * Asserts that the user has a club membership.
   *
   * @param clubId - Club ID from JWT.
   * @throws ForbiddenException if clubId is null.
   */
  private requireClub(clubId: string | null): asserts clubId is string {
    if (!clubId) {
      throw new ForbiddenException('No club membership found.');
    }
  }

  /**
   * Asserts that the report belongs to the user's club.
   *
   * @param reportClubId - Club ID stored on the report.
   * @param userClubId - Club ID from JWT.
   * @throws ForbiddenException if clubs do not match.
   */
  private enforceClubAccess(reportClubId: string, userClubId: string): void {
    if (reportClubId !== userClubId) {
      throw new ForbiddenException(
        'You do not have access to this club\'s reports.',
      );
    }
  }

  /**
   * Fetches the club's SofaScore team ID from the database.
   *
   * @param clubId - Internal club UUID.
   * @returns The club's sofa_score_club_id.
   * @throws NotFoundException if the club does not exist.
   */
  private async resolveClubTeamId(clubId: string): Promise<string> {
    const club = await this.clubRepo.findOne({
      where: { id: clubId },
      select: ['sofa_score_club_id'],
    });

    if (!club) {
      throw new NotFoundException('Club not found.');
    }

    return club.sofa_score_club_id;
  }

  /**
   * Asserts that the requested team ID matches the user's club team.
   *
   * @param requestedTeamId - The teamId from the request body.
   * @param clubTeamId - The sofa_score_club_id from the database.
   * @throws ForbiddenException if the IDs do not match.
   */
  private enforceTeamAccess(
    requestedTeamId: string,
    clubTeamId: string,
  ): void {
    if (requestedTeamId !== clubTeamId) {
      throw new ForbiddenException(
        'You can only analyze your own team.',
      );
    }
  }

  /**
   * Validates the raw AI response against the AiAnalysisDto contract.
   *
   * @param data - Raw JSON object from the AI service.
   * @throws BadGatewayException if required fields are missing or malformed.
   */
  private async validateAiResponse(data: object): Promise<void> {
    const dto = plainToInstance(AiAnalysisDto, data);
    const errors = await validate(dto, {
      whitelist: false,
      forbidNonWhitelisted: false,
    });

    if (errors.length > 0) {
      const details = this.flattenValidationErrors(errors);
      this.logger.error('AI response validation failed:', details);
      throw new BadGatewayException(
        `AI service returned invalid data: ${details.join('; ')}`,
      );
    }
  }

  /**
   * Flattens class-validator errors into an array of readable strings.
   *
   * @param errors - Array of ValidationError from class-validator.
   * @param parentPath - Dot-delimited parent path for nested errors.
   * @returns Flat array of error messages with full property paths.
   */
  private flattenValidationErrors(
    errors: ValidationError[],
    parentPath = '',
  ): string[] {
    const flattened: string[] = [];

    for (const error of errors) {
      const currentPath = parentPath
        ? `${parentPath}.${error.property}`
        : error.property;

      if (error.constraints) {
        for (const message of Object.values(error.constraints)) {
          flattened.push(`${currentPath}: ${message}`);
        }
      }

      if (error.children && error.children.length > 0) {
        flattened.push(
          ...this.flattenValidationErrors(error.children, currentPath),
        );
      }
    }

    return flattened;
  }

  /**
   * Detects a PostgreSQL unique constraint violation (SQLSTATE 23505).
   *
   * @param error - The caught error from a DB save operation.
   * @returns True if the error is a duplicate key violation.
   */
  private isUniqueViolation(error: unknown): boolean {
    if (!(error instanceof QueryFailedError)) {
      return false;
    }

    const driverError = (
      error as QueryFailedError & { driverError?: { code?: string } }
    ).driverError;
    return driverError?.code === '23505';
  }

  /**
   * Extracts the analysis timestamp from the AI payload if present and valid.
   *
   * @param rawData - Raw AI response object.
   * @returns Parsed Date or null if missing/invalid.
   */
  private extractAnalysisTimestamp(rawData: object): Date | null {
    const value = (rawData as Record<string, unknown>).analysis_timestamp;

    if (typeof value !== 'string' || value.trim().length === 0) {
      return null;
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
}
