import {
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ description: 'First name', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  @MinLength(3)
  @Transform(({ value }): string | undefined => {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      return trimmed === '' ? undefined : trimmed;
    }
    return value;
  })
  first_name?: string;

  @ApiProperty({ description: 'First name', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  @MinLength(3)
  @Transform(({ value }): string | undefined => {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      return trimmed === '' ? undefined : trimmed;
    }
    return value;
  })
  last_name?: string;

  @ApiProperty({ description: 'Profile image URL', required: false })
  @IsOptional()
  @IsUrl()
  profile_image_url?: string;
}
