import { ApplicationType, RequestStatus, FormStatus } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsOptional, IsEnum, Min, IsString,
  IsInt,
} from 'class-validator';

export class GetAllArtisanApplicationsQueryDto {
  @IsOptional()
  @IsEnum(ApplicationType)
    type?: ApplicationType;

  @IsOptional()
  @IsEnum(RequestStatus)
    status?: RequestStatus;

  @IsOptional()
  @IsEnum(FormStatus)
    formStatus?: FormStatus;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Transform(({ value }) => {
    const num = Number(value);
    return Number.isNaN(num) ? 20 : num;
  })
  @Min(1)
    page?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Transform(({ value }) => {
    const num = Number(value);
    return Number.isNaN(num) ? 20 : num;
  })
  @Min(1)
    limit?: number;

  @IsOptional()
  @IsString()
    search?: string;
}
