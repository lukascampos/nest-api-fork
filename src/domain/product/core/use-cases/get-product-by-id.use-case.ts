import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@/domain/_shared/utils/either';
import { PrismaProductsRepository } from '../../persistence/prisma/repositories/prisma-products.repository';
import { PrismaArtisanProfilesRepository } from '@/domain/identity/persistence/prisma/repositories/prisma-artisan-profiles.repository';
import { UserNotFoundError } from '@/domain/identity/core/errors/user-not-found.error';
import { ProductNotFoundError } from '../errors/product-not-found.error';
import { S3AttachmentsStorage } from '@/domain/_shared/attachments/persistence/storage/s3-attachments.storage';
import { PrismaAttachmentsRepository } from '@/domain/_shared/attachments/persistence/prisma/repositories/prisma-attachments.repository';

export interface GetProductByIdInput {
  id: string;
}

export interface GetProductByIdOutput {
  id: string;
  title: string;
  description: string;
  priceInCents: number;
  categoryId: number;
  stock: number;
  likesCount: number;
  averageRating: number;
  photos: string[];
  coverPhotoId: string;
  reviews: []
}

type Output = Either<Error, GetProductByIdInput>;

@Injectable()
export class GetProductByIdUseCase {
  constructor(
    private readonly productsRepository: PrismaProductsRepository,
    private readonly artisanRepository: PrismaArtisanProfilesRepository,
    private readonly attachmentsStorage: S3AttachmentsStorage,
    private readonly attachmentsRepository: PrismaAttachmentsRepository,
  ) {}

  async execute({
    id,
  }: GetProductByIdInput): Promise<Output> {
    const product = await this.productsRepository.findById(id);

    if (!product) {
      return left(new ProductNotFoundError(id));
    }

    const artisan = await this.artisanRepository.findByUserId(product.artisanId);

    if (!artisan) {
      return left(new UserNotFoundError(product.artisanId));
    }

    const attachments = await Promise.all(
      (product.photos ? product.photos.getItems() : []).map(
        async (photo) => {
          console.log(photo);
          return this.attachmentsRepository.findById(photo.attachmentId);
        },
      ),
    );

    console.log(attachments);

    const photos = await Promise.all(
      (attachments).map(async (attachment) => {
        const url = await this.attachmentsStorage.getUrlByFileName(attachment!.fileName);
        return url;
      }),
    );

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
      photos,
      coverPhotoId: product.coverPhotoId,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    });
  }
}
