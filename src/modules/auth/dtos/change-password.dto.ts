import { IsNotEmpty, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordReqDto {
  @ApiProperty({
    description: 'The current password of the user for verification.',
    example: 'SecurePassword123!',
  })
  @IsString()
  @IsNotEmpty({
    message: 'You have to provide a current password',
  })
  currentPassword: string;
}

export class ChangePasswordResDto {}
