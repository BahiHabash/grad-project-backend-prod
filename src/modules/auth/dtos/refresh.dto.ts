import { IsNotEmpty, IsString } from 'class-validator';
import { LoginResDto } from './login.dto';

import { ApiProperty } from '@nestjs/swagger';

export class RefreshReqDto {
  @ApiProperty({
    description: 'The refresh token to generate new access and refresh tokens.',
    example: 'd9d7c1ca-db35-470e-beb7-48bf27175f18',
  })
  @IsString()
  @IsNotEmpty({
    message: 'You have to provide a refresh token',
  })
  refreshToken: string;
}

export class RefreshResDto extends LoginResDto {}
