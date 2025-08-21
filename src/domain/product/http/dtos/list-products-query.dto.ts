import {
  IsOptional, IsString, IsUUID, IsNumber,
} from 'class-validator';

export class ListProductsQueryDto {
  @IsOptional()
  @IsUUID()
    id?: string;

  @IsOptional()
  @IsNumber()
    categoryId?: number;

  @IsOptional()
  @IsUUID()
    artisanId?: string;

  @IsOptional()
  @IsString()
    title?: string;
}
