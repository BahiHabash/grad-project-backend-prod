import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

// ─── match_context ───────────────────────────────────────────────────────────

class MatchContextDto {
  @IsString()
  @IsNotEmpty()
  opponent_id: string;

  @IsString()
  @IsNotEmpty()
  match_result: string;

  @IsString()
  @IsNotEmpty()
  team_formation: string;
}

// ─── players_analysis[] ──────────────────────────────────────────────────────

class FatigueAndRiskDto {
  @IsNumber()
  fatigue_index: number;

  @IsString()
  @IsNotEmpty()
  injury_risk_level: string;
}

class PlayerAnalysisDto {
  @IsString()
  @IsNotEmpty()
  player_id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  position: string;

  @IsInt()
  minutes_played: number;

  @ValidateNested()
  @Type(() => FatigueAndRiskDto)
  fatigue_and_risk: FatigueAndRiskDto;
}

// ─── trainingPlan ────────────────────────────────────────────────────────────

class TeamDrillDto {
  @IsString()
  @IsNotEmpty()
  focusCode: string;

  @IsString()
  @IsNotEmpty()
  priority: string;

  @IsString()
  @IsNotEmpty()
  linkedOpponentFeature: string;

  @IsArray()
  @IsString({ each: true })
  targetedPositions: string[];
}

class IndividualDrillDto {
  @IsInt()
  playerId: number;

  @IsString()
  @IsNotEmpty()
  playerName: string;

  @IsString()
  @IsNotEmpty()
  drillCode: string;
}

class TrainingPlanDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TeamDrillDto)
  teamDrills: TeamDrillDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IndividualDrillDto)
  individualDrills: IndividualDrillDto[];
}

// ─── Root AI Response ────────────────────────────────────────────────────────

/**
 * Validation DTO for the AI microservice response.
 *
 * Matches the EXACT contract agreed with the AI team.
 * Used by the service layer to validate the raw response
 * before storing or passing to the LLM.
 */
export class AiAnalysisDto {
  @IsString()
  @IsNotEmpty()
  event_id: string;

  @IsString()
  @IsNotEmpty()
  team_id: string;

  @IsDateString()
  @IsOptional()
  analysis_timestamp: string;

  @ValidateNested()
  @Type(() => MatchContextDto)
  match_context: MatchContextDto;

  @IsArray()
  @ArrayMinSize(1, {
    message: 'players_analysis must contain at least one player.',
  })
  @ValidateNested({ each: true })
  @Type(() => PlayerAnalysisDto)
  players_analysis: PlayerAnalysisDto[];

  @ValidateNested()
  @Type(() => TrainingPlanDto)
  trainingPlan: TrainingPlanDto;
}
