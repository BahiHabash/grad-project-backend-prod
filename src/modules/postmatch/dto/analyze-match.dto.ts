import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Request DTO for triggering a post-match analysis.
 */
export class AnalyzeMatchDto {
  @ApiProperty({
    description: 'The SofaScore event/match identifier.',
    example: '14023985',
  })
  @IsString()
  @IsNotEmpty({ message: 'eventId is required.' })
  eventId: string;

  @ApiProperty({
    description: 'The SofaScore team identifier to analyze for.',
    example: '44',
  })
  @IsString()
  @IsNotEmpty({ message: 'teamId is required.' })
  teamId: string;
}
