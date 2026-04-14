import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { AuthTokenType } from '../constants/auth-token-type.enum';

export class CreateTokenDto {
  @IsNotEmpty()
  @IsString()
  token: string;

  @IsNotEmpty()
  @IsEnum(AuthTokenType)
  type: AuthTokenType;

  @IsNotEmpty()
  @IsUUID()
  user_id: string;

  @IsDate()
  @IsOptional()
  expires_at?: Date;
}
