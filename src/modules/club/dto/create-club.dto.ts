export class CreateClubDto {}
// import { ApiProperty } from '@nestjs/swagger';
// import {
//   IsString,
//   IsNotEmpty,
//   IsOptional,
//   IsEnum,
//   MinLength,
//   MaxLength,
//   Matches,
// } from 'class-validator';
// import { ClubType } from '../constants/club-type.enum';

// export class CreateClubDto {
//   @ApiProperty({
//     description: 'The name of the club',
//     example: 'Computer Science Club',
//   })
//   @IsString()
//   @IsNotEmpty()
//   @MinLength(3, { message: 'Club name must be at least 3 characters' })
//   @MaxLength(100, { message: 'Club name must be at most 100 characters' })
//   @Matches(/^[a-zA-Z0-9\s'-]+$/, {
//     message: 'Club name can only contain letters, numbers, spaces, hyphens, and apostrophes',
//   })
//   name: string;

//   @ApiProperty({
//     description: 'The type of the club',
//     enum: ClubType,
//     example: ClubType.ACADEMIC,
//   })
//   @IsEnum(ClubType, { message: 'Invalid club type' })
//   type: ClubType;

//   @ApiProperty({
//     description: 'The description of the club',
//     example: 'A club for computer science enthusiasts',
//     required: false,
//   })
//   @IsString()
//   @IsOptional()
//   @MinLength(10, { message: 'Description must be at least 10 characters' })
//   description?: string;

//   @ApiProperty({
//     description: 'The logo URL of the club',
//     example: 'https://example.com/logo.png',
//     required: false,
//   })
//   @IsString()
//   @IsOptional()
//   @Matches(/^https?:\/\/.+\.(png|jpg|jpeg|gif|svg)$/i, {
//     message: 'Invalid logo URL format',
//   })
//   logo_url?: string;

//   @ApiProperty({
//     description: 'The cover image URL of the club',
//     example: 'https://example.com/cover.png',
//     required: false,
//   })
//   @IsString()
//   @IsOptional()
//   @Matches(/^https?:\/\/.+\.(png|jpg|jpeg|gif|svg)$/i, {
//     message: 'Invalid cover image URL format',
//   })
//   cover_image_url?: string;

//   @ApiProperty({
//     description: 'The ID of the user who will be the owner of the club',
//     example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
//   })
//   @IsString()
//   @IsNotEmpty()
//   @Matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, {
//     message: 'Invalid user ID format',
//   })
//   owner_id: string;
// }
