import {
  IsString, IsArray, IsDateString, IsOptional,
} from 'class-validator';

export class CompleteArtisanApplicationDto {
  @IsArray()
  @IsString({ each: true })
    rawMaterial: string[];

  @IsArray()
  @IsString({ each: true })
    technique: string[];

  @IsArray()
  @IsString({ each: true })
    finalityClassification: string[];

  @IsOptional()
  @IsString()
    bio: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
    photosIds: string[];

  @IsOptional()
  @IsString()
    sicab: string;

  @IsOptional()
  @IsDateString()
    sicabRegistrationDate: string;

  @IsOptional()
  @IsDateString()
    sicabValidUntil: string;
}
