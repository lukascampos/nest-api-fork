import {
  IsEnum, IsString, ValidateIf,
} from 'class-validator';

export enum ModerationStatus {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export class ModerateArtisanApplicationDto {
  @IsEnum(ModerationStatus)
    status: ModerationStatus;

  @ValidateIf((o) => o.status === ModerationStatus.REJECTED)
  @IsString()
    rejectionReason?: string;
}
