import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { FavoriteTargetType } from '../../../common/enums/favorite-target-type.enum';

export class CreateFavoriteDto {
  @ApiProperty({
    enum: FavoriteTargetType,
    description: 'Type of the favorite target',
  })
  @IsEnum(FavoriteTargetType)
  target_type: FavoriteTargetType;

  @ApiProperty({ description: 'SofaScore external ID of the target entity' })
  @IsString()
  @IsNotEmpty()
  sofa_score_target_id: string;

  @ApiProperty({ description: 'Display name of the favorite target' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  target_name: string;
}
