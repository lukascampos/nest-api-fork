// eslint-disable-next-line max-classes-per-file
import {
  IsUUID, IsNotEmpty, IsString, IsOptional, IsEnum,
} from 'class-validator';
import { RequestStatus } from '@prisma/client';

export class CreateDisableArtisanRequestDto {
  @IsUUID('all', { message: 'Artisan ID must be a valid UUID' })
    artisanId: string;

  @IsNotEmpty({ message: 'reviewerId ID is required' })
    reviewerId: string;

  @IsNotEmpty({ message: 'Reason is required' })
  @IsString()
    reason: string;
}

export class ReviewDisableArtisanRequestDto {
  @IsUUID('all', { message: 'Request ID must be a valid UUID' })
    requestId: string;

  @IsEnum(RequestStatus, {
    message: `Status must be one of: ${Object.values(RequestStatus).join(', ')}`,
  })
    status: RequestStatus;

  @IsOptional()
  @IsString()
    reason?: string;
}
