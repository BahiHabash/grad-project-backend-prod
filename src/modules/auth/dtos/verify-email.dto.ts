import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class VerifyEmailReqDto {
  @ApiProperty({
    description: 'The unique username of the user.',
    example: 'hamo_beka',
  })
  @Matches(/^[a-z][a-z0-9_]*$/, {
    message: 'Invalid username',
  })
  @IsNotEmpty({ message: 'You have to provide a username.' })
  @IsString({ message: 'Username must be a string.' })
  username: string;
}

export class VerifyEmailResDto {
  @ApiProperty({
    description: 'The JWT access token.',
  })
  accessToken: string;

  @ApiProperty({
    description: 'The random refresh token.',
  })
  refreshToken: string;
}
