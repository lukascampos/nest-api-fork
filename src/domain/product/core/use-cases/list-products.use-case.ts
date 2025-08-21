import { Injectable } from '@nestjs/common';
import { Either, right } from '@/domain/_shared/utils/either';
import { PrismaProductsRepository } from '../../persistence/prisma/repositories/prisma-products.repository';
import { S3AttachmentsStorage } from '@/domain/_shared/attachments/persistence/storage/s3-attachments.storage';
import { PrismaUsersRepository } from '@/domain/identity/persistence/prisma/repositories/prisma-users.repository';

export interface ListProductsInput {
  id?: string;
  categoryId?: number;
  artisanId?: string;
  title?: string;
}

export interface ListProductsOutput {
  id: string;
  authorName: string;
  authorId: string;
  title: string;
  priceInCents: number;
  categoryId: number;
  isLiked: boolean;
  coverPhoto?: string;
}

type Output = Either<Error, ListProductsOutput[]>;

@Injectable()
export class ListProductsUseCase {
  constructor(
    private readonly productsRepository: PrismaProductsRepository,
    private readonly s3AttachmentStorage: S3AttachmentsStorage,
    private readonly usersProfileRepository: PrismaUsersRepository,
  ) {}

  async execute({
    id,
    artisanId,
    categoryId,
    title,
  }: ListProductsInput): Promise<Output> {
    const products = await this.productsRepository.list({
      id,
      artisanId,
      categoryId,
      title,
    });

    const authors = products
      .map((product) => this.usersProfileRepository.findById(product.artisanId));

    const [resolvedAuthors] = await Promise.all([
      Promise.all(authors),
    ]);

    const output = await Promise.all(
      products.map(async (product, index) => {
        const author = resolvedAuthors[index];
        const coverPhoto = await this.s3AttachmentStorage.getUrlByFileName(product.coverPhotoId!);

        return {
          id: product.id,
          authorName: author!.name,
          authorId: author!.id,
          title: product.title,
          priceInCents: product.priceInCents,
          categoryId: product.categoryId,
          isLiked: false,
          coverPhoto,
        };
      }),
    );

    return right(output);
  }
}
