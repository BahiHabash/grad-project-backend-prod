import {
  IsInt,
  IsDateString,
  IsString,
  IsArray,
  ValidateNested,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class MetaData {
  @IsInt()
  teamId: number;

  @IsInt()
  opponentId: number;

  @IsDateString()
  matchDate: string;

  @IsDateString()
  analysisTimestamp: string;
}

class TeamDrillDto {
  @IsString()
  focusCode: string;

  @IsString()
  priority: string;

  @IsString()
  linkedOpponentFeature: string;

  @IsArray()
  @IsString({ each: true })
  targetedPositions: string[];
}

class IndividualDrillDto {
  @IsInt()
  playerId: number;

  @IsString()
  playerName: string;

  @IsString()
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

class SelectionFactorsDto {
  @IsNumber()
  form: number;

  @IsNumber()
  fitness: number;

  @IsNumber()
  matchupAdvantage: number;
}

class StartingPlayerDto {
  @IsInt()
  playerId: number;

  @IsString()
  name: string;

  @IsString()
  position: string;

  @IsString()
  @IsOptional()
  role?: string;

  @IsNumber()
  suitabilityScore: number;

  @ValidateNested()
  @Type(() => SelectionFactorsDto)
  selectionFactors: SelectionFactorsDto;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  reasonCodes?: string[];
}

class SubstitutePlayerDto {
  @IsInt()
  playerId: number;

  @IsString()
  name: string;

  @IsArray()
  @IsString({ each: true })
  positions: string[];

  @IsNumber()
  @IsOptional()
  suitabilityScore?: number;
}

class TeamSelectionDto {
  @IsString()
  suggestedFormation: string;

  @IsString()
  strategyCode: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StartingPlayerDto)
  startingXI: StartingPlayerDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubstitutePlayerDto)
  substitutes: SubstitutePlayerDto[];
}

class TacticalMetricsDto {
  @IsNumber()
  avgPossession: number;

  @IsNumber()
  avgPassAccuracy: number;

  @IsNumber()
  avgPPDA: number;

  @IsNumber()
  longBallRatio: number;
}

class TacticalStyleDto {
  @IsString()
  inferredFormation: string;

  @IsArray()
  @IsString({ each: true })
  styleLabels: string[];

  @ValidateNested()
  @Type(() => TacticalMetricsDto)
  metrics: TacticalMetricsDto;
}

class KeyStatDto {
  @IsString()
  label: string;

  @IsNumber()
  value: number;
}

class KeyThreatDto {
  @IsInt()
  playerId: number;

  @IsString()
  name: string;

  @IsArray()
  @IsString({ each: true })
  position: string[];

  @IsNumber()
  threatScore: number;

  @IsArray()
  @IsString({ each: true })
  threatCodes: string[];

  @ValidateNested()
  @Type(() => KeyStatDto)
  keyStat: KeyStatDto;
}

class OpponentAnalysisDto {
  @ValidateNested()
  @Type(() => TacticalStyleDto)
  tacticalStyle: TacticalStyleDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => KeyThreatDto)
  keyThreats: KeyThreatDto[];

  @IsArray()
  @IsString({ each: true })
  vulnerabilities: string[];
}

export class PreMatchResDto {
  @ApiProperty({
    description: 'Meta information about the match',
    type: () => MetaData,
  })
  @ValidateNested()
  @Type(() => MetaData)
  meta: MetaData;

  @ApiProperty({
    description: 'Training plan for the match',
    type: () => TrainingPlanDto,
  })
  @ValidateNested()
  @Type(() => TrainingPlanDto)
  trainingPlan: TrainingPlanDto;

  @ApiProperty({
    description: 'Team selection details',
    type: () => TeamSelectionDto,
  })
  @ValidateNested()
  @Type(() => TeamSelectionDto)
  teamSelection: TeamSelectionDto;

  @ApiProperty({
    description: 'Opponent analysis data',
    type: () => OpponentAnalysisDto,
  })
  @ValidateNested()
  @Type(() => OpponentAnalysisDto)
  opponentAnalysis: OpponentAnalysisDto;
}
