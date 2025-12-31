import { IsEmail, IsNotEmpty } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordReqDto {
  @ApiProperty({
    description: 'The email address of the user who forgot their password.',
    example: 'user@example.com',
    format: 'email',
  })
  @IsEmail()
  @IsNotEmpty({
    message: 'You have to provide an email.',
  })
  email: string;
}

export class ForgotPasswordResDto {}
