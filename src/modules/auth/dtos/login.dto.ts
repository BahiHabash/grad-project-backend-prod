import { IsNotEmpty, IsString, Length } from 'class-validator';
import {
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
} from '../constants/auth.constants';
import { ApiProperty } from '@nestjs/swagger';

export class LoginReqDto {
  @ApiProperty({
    description: 'The unique email or username of the user.',
    example: 'abdo.kabary@kobry.com | bahi_habash',
  })
  @IsString({ message: 'Username or Email must be a string.' })
  @IsNotEmpty({
    message: 'You have to provide a username or email',
  })
  identifier: string;

  @ApiProperty({
    description: "The user's password.",
    example: 'SecurePassword123!',
  })
  @IsString({ message: 'Password must be a string.' })
  @IsNotEmpty({ message: 'You have to provide a password.' })
  @Length(MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH, {
    message: `Password length must be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH}.`,
  })
  password: string;
}

export class LoginResDto {
  @ApiProperty({
    description: 'The JWT access token valid for 15 minutes.',
    example: 'eyJhbGciOiJIUzI1Ni.eyJhbGciOiJIUzI1Ni.eyJhbGciOiJIUzI1Ni',
  })
  accessToken: string;

  @ApiProperty({
    description: 'The random refresh token valid for 7 days.',
    example: 'd9d7c1ca-db35-470e-beb7-48bf27175f18',
  })
  refreshToken: string;
}
