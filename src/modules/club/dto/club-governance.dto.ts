import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

/**
 * DTO for initiating club ownership succession.
 *
 * @field targetUserId - UUID of the STAFF member to promote to OWNER
 */
export class SuccessionDto {
  @ApiProperty({
    description: 'UUID of the STAFF member to be promoted to OWNER',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsUUID('4')
  targetUserId: string;
}

/**
 * Response DTO representing a club's public profile.
 */
export class ClubResponseDto {
  @ApiProperty({ example: 'uuid-v4' })
  id: string;

  @ApiProperty({ example: 'Al Ahly SC' })
  name: string;

  @ApiPropertyOptional({ example: 'Egyptian football club' })
  description: string | null;

  @ApiProperty({ example: '12345' })
  sofa_score_club_id: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/logo.png' })
  logo_url: string | null;

  @ApiProperty({ example: 'uuid-of-owner' })
  owner_id: string;

  @ApiProperty({ example: 'ACTIVE' })
  status: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  created_at: Date;
}

/**
 * Paginated list of clubs response.
 */
export class PaginatedClubsResponseDto {
  @ApiProperty({ type: [ClubResponseDto] })
  clubs: ClubResponseDto[];

  @ApiProperty({ example: 50 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;
}
