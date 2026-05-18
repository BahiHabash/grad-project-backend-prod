import { IsEnum, IsUUID, ValidateIf } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StorageFilePurpose } from '../../../common/enums/storage-file-purpose.enum';

/**
 * Data Transfer Object for requesting a Cloudinary signed upload signature.
 */
export class StorageSignatureReqDto {
  /**
   * The purpose of the file being uploaded
   * @example 'PROFILE_IMAGE'
   */
  @ApiProperty({
    description: 'The purpose of the file being uploaded',
    enum: StorageFilePurpose,
    example: StorageFilePurpose.PROFILE_IMAGE,
  })
  @IsEnum(StorageFilePurpose, {
    message: `purpose must be one of: ${Object.values(StorageFilePurpose).join(', ')}`,
  })
  purpose: StorageFilePurpose;

  /**
   * The ID of the target entity (e.g. user_id for profiles, club_id for logos)
   * @example 'e2e604f2-95f3-4fb0-86c3-1ad394ea7d08'
   */
  @ApiPropertyOptional({
    description:
      'The UUID of the target entity (required except when purpose is CLAIM_DOCUMENT)',
    example: 'e2e604f2-95f3-4fb0-86c3-1ad394ea7d08',
  })
  @ValidateIf((o: StorageSignatureReqDto) => o.purpose !== StorageFilePurpose.CLAIM_DOCUMENT)
  @IsUUID('4', { message: 'entityId must be a valid UUID v4' })
  entityId?: string;
}
