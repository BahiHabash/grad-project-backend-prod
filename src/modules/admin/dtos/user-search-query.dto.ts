import { IsOptional, IsString, IsEnum, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AccountStatus } from '../../../common/enums/account-status.enum';
import { SystemRole } from '../../../common/enums/system-role.enum';
import { MemberRole } from 'src/common/enums/member-role.enum';

/**
 * Query DTO for searching users with filters and pagination.
 */
export class UserSearchQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by email (partial match, case-insensitive)',
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({
    description: 'Filter by username (partial match, case-insensitive)',
  })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({
    description: 'Filter by account status',
    enum: AccountStatus,
  })
  @IsOptional()
  @IsEnum(AccountStatus)
  status?: AccountStatus;

  @ApiPropertyOptional({
    description: 'Filter by system role',
    enum: SystemRole,
  })
  @IsOptional()
  @IsEnum(SystemRole)
  system_role?: SystemRole;

  @ApiPropertyOptional({
    description: 'Filter by member role',
    enum: MemberRole,
  })
  @IsOptional()
  @IsEnum(MemberRole)
  member_role?: MemberRole;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({
    description: 'Number of records per page',
    default: 10,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 10;
}
