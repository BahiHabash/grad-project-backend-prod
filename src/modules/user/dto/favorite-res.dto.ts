import { ApiProperty } from '@nestjs/swagger';
import { FavoriteTargetType } from '../../../common/enums/favorite-target-type.enum';

export class FavoriteResDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  user_id: string;

  @ApiProperty({ enum: FavoriteTargetType })
  target_type: FavoriteTargetType;

  @ApiProperty({ description: 'SofaScore external ID' })
  sofa_score_target_id: string;

  @ApiProperty()
  target_name: string;

  @ApiProperty()
  created_at: Date;
}
