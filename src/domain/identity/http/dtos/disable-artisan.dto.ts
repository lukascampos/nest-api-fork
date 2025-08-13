import {
  IsString, IsNotEmpty, IsOptional, IsIn,
  IsEnum,
  ValidateIf,
} from 'class-validator';
import { ArtisanApplicationStatus } from '../../core/entities/artisan-application.entity';
import { Transform } from 'class-transformer';

export class ReviewDisableArtisanDto {
  @IsNotEmpty()
  @Transform(({ value }) => (typeof value === 'string' ? value.toUpperCase() : value))
  @IsEnum(ArtisanApplicationStatus, {message: 'status must be PENDING, APPROVED or REJECTED'})
  status: ArtisanApplicationStatus;

  @ValidateIf(o => o.status === ArtisanApplicationStatus.REJECTED)
  @IsString()
  @IsNotEmpty({ message: 'rejectionReason is required when status is REJECTED' })
  rejectionReason?: string;
}
