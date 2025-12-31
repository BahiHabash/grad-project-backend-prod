import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import {
  MIN_PASSWORD_LENGTH,
  MAX_PASSWORD_LENGTH,
} from '../constants/auth.constants';
import { ApiProperty } from '@nestjs/swagger';

export class SignUpReqDto {
  @ApiProperty({
    description: 'The unique email address of the user.',
    example: 'abdo.kabary@kobry.com',
    format: 'email',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'The unique username of the user.',
    example: 'abdo_kabary',
  })
  @Matches(/^[a-z][a-z0-9_]*$/, {
    message:
      'Username must start with a letter and contain only lowercase letters, numbers, or underscores.',
  })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({
    description: "The user's chosen password.",
    example: 'SecurePassword123!',
    minLength: MIN_PASSWORD_LENGTH,
    maxLength: MAX_PASSWORD_LENGTH,
  })
  @IsNotEmpty()
  @IsString()
  @Length(MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH, {
    message: `Password must be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters long.`,
  })
  password: string;

  @ApiProperty({
    description: "The user's first name.",
    example: 'Abdo',
  })
  @IsNotEmpty()
  @IsString()
  first_name: string;

  @ApiProperty({
    description: "The user's last name.",
    example: 'Kabary',
    required: false,
  })
  @IsString()
  @IsOptional()
  last_name?: string;
}

export class SignUpResDto {
  @ApiProperty({
    description: 'The JWT access token.',
  })
  accessToken: string;

  @ApiProperty({
    description: 'The random refresh token.',
  })
  refreshToken: string;
}
