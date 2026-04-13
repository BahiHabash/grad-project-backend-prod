import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadGatewayException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { PinoLogger } from 'nestjs-pino';
import { plainToInstance } from 'class-transformer';
import { validate, type ValidationError } from 'class-validator';

import { PostMatchReport } from './entities/postmatch-report.entity';
import { AiModelClient } from './providers/ai-model.client';
import { LlmClient } from './providers/llm/llm.client';
import { AiAnalysisDto } from './dto/ai-analysis.dto';
import { ReportStatus } from './constants/report-status.enum';

// ─── Return types ────────────────────────────────────────────────────────────

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

// ─── Service ─────────────────────────────────────────────────────────────────

/**
 * Orchestrates the post-match analysis pipeline.
 *
 * Flow: Check cache → Call AI → Validate → Call LLM → Store → Return
 *
 * Caching is team-based: one report per (event_id, team_id).
 * `requested_by_id` is stored for audit purposes only.
 */
@Injectable()
export class PostmatchService {
  constructor(
    @InjectRepository(PostMatchReport)
    private readonly reportRepo: Repository<PostMatchReport>,
    private readonly aiClient: AiModelClient,
    private readonly llmClient: LlmClient,
    private readonly logger: PinoLogger,
  ) {}

  // ─── 1. Analyze Match ──────────────────────────────────────────────────

  /**
   * Triggers a full post-match analysis for a given match and team.
   *
   * Returns a cached report if one exists for (eventId, teamId),
   * otherwise runs the full AI → LLM → Store pipeline.
   */
  async analyzeMatch(
    eventId: string,
    teamId: string,
    userId: string,
  ): Promise<ReportResult> {
    // Step 1: Check cache (team-based, not user-based)
    const cached = await this.reportRepo.findOne({
      where: { event_id: eventId, team_id: teamId },
    });

    if (cached) {
      this.logger.info(`Cache hit for event=${eventId}, team=${teamId}`);
      return { report: cached, cached: true };
    }

    this.logger.info(`Cache miss. Starting analysis pipeline...`);

    // Step 2: Call AI service
    const rawData = await this.aiClient.analyze(eventId, teamId);

    // Step 3: Validate AI response against agreed contract
    await this.validateAiResponse(rawData);

    // Step 4: Call LLM (graceful degradation)
    let llmExplanation: string | null = null;
    let llmModel: string | null = null;

    const llmResult = await this.llmClient.explain(rawData);
    if (llmResult) {
      llmExplanation = llmResult.text;
      llmModel = llmResult.model;
    }

    // Step 5: Determine status
    const status = llmExplanation
      ? ReportStatus.COMPLETED
      : ReportStatus.PARTIAL;
    const analysisTimestamp = this.extractAnalysisTimestamp(rawData);

    // Step 6: Persist
    const report = this.reportRepo.create({
      event_id: eventId,
      team_id: teamId,
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

  // ─── 2. Get Report by ID ──────────────────────────────────────────────

  async getReport(reportId: string): Promise<PostMatchReport> {
    const report = await this.reportRepo.findOne({
      where: { id: reportId },
    });

    if (!report) {
      throw new NotFoundException(`Report with id "${reportId}" not found.`);
    }

    return report;
  }

  // ─── 3. List Reports (Paginated) ──────────────────────────────────────

  async getReports(
    userId: string,
    page: number,
    limit: number,
  ): Promise<PaginatedReports> {
    const [reports, total] = await this.reportRepo.findAndCount({
      where: { requested_by_id: userId },
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

  // ─── 4. Retry LLM Explanation ─────────────────────────────────────────

  /**
   * Retries the LLM explanation for a report that has status PARTIAL.
   * Does NOT re-run the AI analysis — only generates the missing explanation.
   */
  async retryExplanation(reportId: string): Promise<PostMatchReport> {
    const report = await this.getReport(reportId);

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

  // ─── Private Helpers ──────────────────────────────────────────────────

  /**
   * Validates the raw AI response against the agreed contract (AiAnalysisDto).
   * Throws BadGatewayException if required fields are missing or malformed.
   *
   * Uses whitelist:false because the AI contract is stable and trusted —
   * extra fields are accepted and stored as-is.
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

  /** Flattens class-validator errors, including nested property paths. */
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

  /** Detects PostgreSQL duplicate key violation (SQLSTATE 23505). */
  private isUniqueViolation(error: unknown): boolean {
    if (!(error instanceof QueryFailedError)) {
      return false;
    }

    const driverError = (
      error as QueryFailedError & { driverError?: { code?: string } }
    ).driverError;
    return driverError?.code === '23505';
  }

  /** Safely extracts analysis timestamp from AI payload if present and valid. */
  private extractAnalysisTimestamp(rawData: object): Date | null {
    const value = (rawData as Record<string, unknown>).analysis_timestamp;

    if (typeof value !== 'string' || value.trim().length === 0) {
      return null;
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
}
