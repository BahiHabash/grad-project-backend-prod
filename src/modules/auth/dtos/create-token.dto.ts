import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { TokenType } from '../constants/token-type.enum';

export class CreateTokenDto {
  @IsNotEmpty()
  @IsString()
  token: string;

  @IsNotEmpty()
  @IsEnum(TokenType)
  type: TokenType;

  @IsNotEmpty()
  @IsUUID()
  user_id: string;

  @IsDate()
  @IsOptional()
  expires_at?: Date;
}
