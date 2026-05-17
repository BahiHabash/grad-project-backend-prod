import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AccountStatus } from '../../../common/enums/account-status.enum';

/**
 * DTO for updating a user's account status.
 */
export class UpdateUserStatusDto {
  @ApiProperty({
    description: 'The new status to assign to the user account',
    enum: AccountStatus,
    example: AccountStatus.BANNED,
  })
  @IsEnum(AccountStatus)
  @IsNotEmpty()
  status: AccountStatus;
}
