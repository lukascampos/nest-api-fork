import { Either, right } from '@/domain/_shared/utils/either';
import { Product } from '../entities/product.entity';
import { PrismaProductsRepository } from '../../persistence/prisma/repositories/prisma-products.repository';
import { ProductPhoto } from '../entities/product-photo.entity';
import { ProductPhotosList } from '../entities/product-photos-list.entity';
import { Injectable } from '@nestjs/common';

export interface CreateProductInput {
  artisanId: string;
  title: string;
  description: string;
  priceInCents: number;
  categoryId: number;
  stock: number;
  photoIds: string[];
  coverPhotoId?: string;
}

export interface CreateProductOutput {
  id: string;
  artisanId: string;
  title: string;
  description: string;
  priceInCents: number;
  categoryId: number;
  stock: number;
  likesCount: number;
  averageRating: number;
  photos: ProductPhoto[];
  coverPhotoId?: string;
  createdAt: Date;
  updatedAt: Date;
}

type Output = Either<Error, CreateProductOutput>;

@Injectable()
export class CreateProductUseCase {
  constructor(
    private readonly productsRepository: PrismaProductsRepository,
  ) {}

  async execute({
    artisanId,
    title,
    description,
    priceInCents,
    categoryId,
    stock,
    photoIds,
    coverPhotoId,
  }: CreateProductInput): Promise<Output> {
    const product = Product.create({
      artisanId,
      title,
      description,
      priceInCents,
      categoryId,
      stock,
      coverPhotoId,
      likesCount: 0,
    })

    const productPhotos = photoIds.map((photoId) => {
      return ProductPhoto.create({
        attachmentId: photoId,
        productId: product.id,
      })
    });

    product.photos = new ProductPhotosList(productPhotos);

    await this.productsRepository.save(product);

    return right({
      id: product.id,
      artisanId: product.artisanId,
      title: product.title,
      description: product.description,
      priceInCents: product.priceInCents,
      categoryId: product.categoryId,
      stock: product.stock,
      likesCount: product.likesCount,
      averageRating: product.averageRating ?? 0,
      photos: product.photos.getItems(),
      coverPhotoId: product.coverPhotoId,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    })
  }
}
