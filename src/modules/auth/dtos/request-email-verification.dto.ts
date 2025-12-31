import { IsEmail, IsNotEmpty } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class RequestEmailVerificationReqDto {
  @ApiProperty({
    description: 'The email address to resend the verification token to.',
    example: 'abdo.kabary@kobry.com',
    format: 'email',
  })
  @IsEmail()
  @IsNotEmpty({
    message: 'You have to Provide an email.',
  })
  email: string;
}

export class RequestEmailVerificationResDto {}
