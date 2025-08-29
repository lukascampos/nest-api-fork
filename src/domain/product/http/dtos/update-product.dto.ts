import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
    description?: string;

  @IsOptional()
  @IsNumber()
    priceInCents?: number;

  @IsOptional()
  @IsNumber()
    stock?: number;

  @IsOptional()
  @IsString({ each: true })
    deletedPhotos?: string[];

  @IsOptional()
  @IsString({ each: true })
    newPhotos?: string[];

  @IsOptional()
  @IsString()
    coverPhotoId?: string;

  @IsOptional()
  @IsNumber()
    categoryId?: number;
}
