import { IsOptional, IsString, IsEnum, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AccountStatus } from '../../../common/enums/account-status.enum';
import { SystemRole } from '../../../common/enums/system-role.enum';
import { MemberRole } from '../../../common/enums/member-role.enum';
import { UserPublicProfileResDto } from './user-public-profile.dto';

/** Allowed fields for sorting users */
export enum UserSortField {
  CREATED_AT = 'created_at',
  EMAIL = 'email',
  USERNAME = 'username',
}

/** Allowed sorting direction options */
export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

/**
 * Query DTO for searching users with filters, sorting, and pagination.
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
    description: 'Field to sort users by (whitelisted options only)',
    enum: UserSortField,
    default: UserSortField.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(UserSortField)
  sortBy?: UserSortField = UserSortField.CREATED_AT;

  @ApiPropertyOptional({
    description: 'Sort direction order (ASC or DESC)',
    enum: SortOrder,
    default: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;

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

export class UserSearchResultDto {
  @ApiProperty({
    description: 'List of users (without club object).',
    type: [UserPublicProfileResDto],
  })
  users: Omit<UserPublicProfileResDto, 'club'>[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}
