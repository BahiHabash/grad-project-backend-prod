import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { AccessTokenPayload } from '../auth/constants/token-payload.type';
import { PostmatchService } from './postmatch.service';
import { PostMatchReport } from './entities/postmatch-report.entity';
import { AnalyzeMatchDto } from './dto/analyze-match.dto';
import { ListReportsQueryDto } from './dto/postmatch-report.dto';

@ApiTags('Post-Match Analysis')
@ApiBearerAuth()
@Controller('post-match')
export class PostmatchController {
  constructor(private readonly postmatchService: PostmatchService) {}

  // ─── 1. Trigger Analysis ──────────────────────────────────────────────

  @Post('analyze')
  @ApiOperation({
    summary: 'Trigger a post-match analysis',
    description:
      'Analyzes a completed match using the AI service and generates an LLM explanation. Returns a cached report if one already exists for this match.',
  })
  @ResponseMessage('Post-match analysis completed successfully.')
  async analyze(
    @Body() dto: AnalyzeMatchDto,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    const { report, cached } = await this.postmatchService.analyzeMatch(
      dto.eventId,
      dto.teamId,
      user.id,
    );

    return this.toReportResponse(report, cached);
  }

  // ─── 2. List Reports ─────────────────────────────────────────────────

  @Get('reports')
  @ApiOperation({
    summary: 'List post-match reports',
    description: 'Returns a paginated list of cached reports.',
  })
  @ResponseMessage('Reports retrieved successfully.')
  async listReports(
    @Query() query: ListReportsQueryDto,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    const { reports, total, page, limit } =
      await this.postmatchService.getReports(
        user.id,
        query.page!,
        query.limit!,
      );

    return {
      reports: reports.map((r) => this.toReportSummary(r)),
      total,
      page,
      limit,
    };
  }

  // ─── 3. Get Report by ID ─────────────────────────────────────────────

  @Get('reports/:id')
  @ApiOperation({
    summary: 'Get a specific post-match report',
    description:
      'Returns the full report including raw analysis and LLM explanation.',
  })
  @ResponseMessage('Report retrieved successfully.')
  async getReport(@Param('id', ParseUUIDPipe) id: string) {
    const report = await this.postmatchService.getReport(id);
    return this.toReportResponse(report, true);
  }

  // ─── 4. Retry LLM Explanation ────────────────────────────────────────

  @Post('reports/:id/explain')
  @ApiOperation({
    summary: 'Retry LLM explanation for a partial report',
    description:
      'Re-runs the LLM explanation step for a report that has status PARTIAL. Does NOT re-run the AI analysis.',
  })
  @ResponseMessage('LLM explanation generated successfully.')
  async retryExplanation(@Param('id', ParseUUIDPipe) id: string) {
    const report = await this.postmatchService.retryExplanation(id);
    return this.toReportResponse(report, false);
  }

  // ─── Response Mappers ────────────────────────────────────────────────

  /**
   * Maps a PostMatchReport entity to the full API response shape.
   * Single source of truth for the response contract.
   */
  private toReportResponse(report: PostMatchReport, cached: boolean) {
    return {
      id: report.id,
      eventId: report.event_id,
      teamId: report.team_id,
      status: report.status,
      rawAnalysis: report.raw_analysis,
      llmExplanation: report.llm_explanation,
      llmModel: report.llm_model,
      analysisTimestamp: report.analysis_timestamp,
      createdAt: report.created_at,
      cached,
    };
  }

  /**
   * Maps a PostMatchReport entity to a lightweight summary
   * (used in the paginated list endpoint).
   */
  private toReportSummary(report: PostMatchReport) {
    return {
      id: report.id,
      eventId: report.event_id,
      teamId: report.team_id,
      status: report.status,
      analysisTimestamp: report.analysis_timestamp,
      createdAt: report.created_at,
    };
  }
}
