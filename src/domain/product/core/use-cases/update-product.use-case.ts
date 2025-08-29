import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@/domain/_shared/utils/either';
import { PrismaProductsRepository } from '../../persistence/prisma/repositories/prisma-products.repository';
import { ProductNotFoundError } from '../errors/product-not-found.error';
import { ProductPhoto } from '../entities/product-photo.entity';
import { NotAllowedError } from '../errors/not-allowed.error';
import { S3AttachmentsStorage } from '@/domain/_shared/attachments/persistence/storage/s3-attachments.storage';

export interface UpdateProductInput {
  productId: string;
  authorId: string;
  title?: string;
  description?: string;
  priceInCents?: number;
  stock?: number;
  deletedPhotos?: string[];
  newPhotos?: string[];
  coverPhotoId?: string;
  categoryId?: number;
}

export interface UpdateProductOutput {
  id: string;
  authorId: string;
  title: string;
  description?: string;
  priceInCents: number;
  stock: number;
  categoryId: number;
  photos: string[];
  coverPhoto?: string;
}

type Output = Either<Error, UpdateProductOutput>;

@Injectable()
export class UpdateProductUseCase {
  constructor(
    private readonly productRepository: PrismaProductsRepository,
    private readonly s3AttachmentsStorage: S3AttachmentsStorage,
  ) {}

  async execute({
    productId,
    authorId,
    categoryId,
    coverPhotoId,
    title,
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
      return left(new NotAllowedError());
    }

    if (title) {
      product.title = title;
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

    const photos: string[] = [];

    if (newPhotos && newPhotos.length > 0) {
      await Promise.all(
        newPhotos.map(async (photo) => {
          photos.push(await this.s3AttachmentsStorage.getUrlByFileName(photo));
          const productPhoto = ProductPhoto.create({
            attachmentId: photo,
            productId: product.id,
          });
          product.photos?.add(productPhoto);
        }),
      );
    }

    let coverPhoto: string | undefined;

    if (coverPhotoId) {
      coverPhoto = await this.s3AttachmentsStorage.getUrlByFileName(coverPhotoId);
      product.coverPhotoId = coverPhotoId;
    }

    if (categoryId) {
      product.categoryId = categoryId;
    }

    await this.productRepository.save(product);

    return right({
      id: product.id,
      authorId: product.artisanId,
      title: product.title,
      description: product.description,
      priceInCents: product.priceInCents,
      stock: product.stock,
      categoryId: product.categoryId,
      photos,
      coverPhoto: coverPhoto ?? undefined,
    });
  }
}
