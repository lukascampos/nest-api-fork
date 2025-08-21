import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@/domain/_shared/utils/either';
import { PrismaProductsRepository } from '../../persistence/prisma/repositories/prisma-products.repository';
import { Product } from '../entities/product.entity';
import { ProductNotFoundError } from '../errors/product-not-found.error';
import { ProductPhoto } from '../entities/product-photo.entity';
import { NotAlloweError } from '../errors/not-allowed.error';

export interface UpdateProductInput {
  productId: string;
  authorId: string;
  description?: string;
  priceInCents?: number;
  stock?: number;
  deletedPhotos?: string[];
  newPhotos?: string[];
  coverPhotoId?: string;
  categoryId?: number;
}

export interface UpdateProductOutput {
  product: Product;
}

type Output = Either<Error, UpdateProductOutput>;

@Injectable()
export class UpdateProductUseCase {
  constructor(private readonly productRepository: PrismaProductsRepository) {}

  async execute({
    productId,
    authorId,
    categoryId,
    coverPhotoId,
    description,
    deletedPhotos,
    newPhotos,
    priceInCents,
    stock,
  }: UpdateProductInput): Promise<Output> {
    const product = await this.productRepository.findById(productId);

    if (!product) {
      return left(new ProductNotFoundError(productId));
    }

    if (product.artisanId !== authorId) {
      return left(new NotAlloweError());
    }

    if (description) {
      product.description = description;
    }

    if (priceInCents) {
      product.priceInCents = priceInCents;
    }

    if (stock) {
      product.stock = stock;
    }

    if (deletedPhotos && deletedPhotos.length > 0) {
      deletedPhotos.forEach((photo) => {
        const productPhoto = ProductPhoto.create({
          attachmentId: photo,
          productId: product.id,
        });

        product.photos?.remove(productPhoto);
      });
    }

    if (newPhotos && newPhotos.length > 0) {
      newPhotos.forEach((photo) => {
        const productPhoto = ProductPhoto.create({
          attachmentId: photo,
          productId: product.id,
        });

        product.photos?.add(productPhoto);
      });
    }

    if (coverPhotoId) {
      product.coverPhotoId = coverPhotoId;
    }

    if (categoryId) {
      product.categoryId = categoryId;
    }

    await this.productRepository.save(product);

    return right({ product });
  }
}
