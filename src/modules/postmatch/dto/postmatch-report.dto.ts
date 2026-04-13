import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ReportStatus } from '../constants/report-status.enum';
import {
  DEFAULT_PAGE_LIMIT,
  MAX_PAGE_LIMIT,
} from '../constants/postmatch.constants';

// ─── Single Report Response ──────────────────────────────────────────────────

/**
 * Shape of a single post-match report returned by the API.
 * Used for Swagger documentation.
 */
export class PostmatchReportDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ example: '14023985' })
  eventId: string;

  @ApiProperty({ example: '44' })
  teamId: string;

  @ApiProperty({ enum: ReportStatus, example: ReportStatus.COMPLETED })
  status: ReportStatus;

  @ApiProperty({ description: 'Full AI analysis JSON.' })
  rawAnalysis: object;

  @ApiPropertyOptional({
    description:
      'LLM-generated human-readable explanation. Null if status is PARTIAL.',
    example: 'Based on the analysis...',
  })
  llmExplanation: string | null;

  @ApiPropertyOptional({ example: 'gemini-2.0-flash' })
  llmModel: string | null;

  @ApiPropertyOptional()
  analysisTimestamp: string | null;

  @ApiProperty()
  createdAt: string;

  @ApiProperty({ description: 'True if the report was returned from cache.' })
  cached: boolean;
}

// ─── List Reports Response ───────────────────────────────────────────────────

/**
 * A summary item used when listing reports (omits large rawAnalysis / explanation).
 */
export class PostmatchReportSummaryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  eventId: string;

  @ApiProperty()
  teamId: string;

  @ApiProperty({ enum: ReportStatus })
  status: ReportStatus;

  @ApiPropertyOptional()
  analysisTimestamp: string | null;

  @ApiProperty()
  createdAt: string;
}

export class PaginatedReportsDto {
  @ApiProperty({ type: [PostmatchReportSummaryDto] })
  reports: PostmatchReportSummaryDto[];

  @ApiProperty({ example: 42 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;
}

// ─── Pagination Query ────────────────────────────────────────────────────────

export class ListReportsQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    default: DEFAULT_PAGE_LIMIT,
    minimum: 1,
    maximum: MAX_PAGE_LIMIT,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_PAGE_LIMIT)
  limit?: number = DEFAULT_PAGE_LIMIT;
}
