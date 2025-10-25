import { Injectable, Logger } from '@nestjs/common';
import { Either, left, right } from '@/domain/_shared/utils/either';
import { ProductNotFoundError } from '../errors/product-not-found.error';
import { ProductsRepository } from '@/domain/repositories/products.repository';
import { S3StorageService } from '@/domain/attachments/s3-storage.service';
import { NotAllowedError } from '@/domain/identity/core/errors/not-allowed.error';
import { AttachmentsRepository } from '@/domain/repositories/attachments.repository';
import { InvalidAttachmentError } from '@/domain/identity/core/errors/invalid-attachment.error';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { InvalidProductDataError } from '../errors/invalid-product-data.error';

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
}

export interface UpdateProductOutput {
  id: string;
  authorId: string;
  title: string;
  description?: string;
  priceInCents: number;
  stock: number;
  categoryIds: number[];
  photos: string[];
  coverPhoto?: string;
}

type Output = Either<Error, UpdateProductOutput>;

@Injectable()
export class UpdateProductUseCase {
  private readonly logger = new Logger(UpdateProductUseCase.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly productsRepository: ProductsRepository,
    private readonly attachmentsRepository: AttachmentsRepository,
    private readonly s3StorageService: S3StorageService,
  ) {}

  async execute({
    productId,
    authorId,
    coverPhotoId,
    title,
    description,
    deletedPhotos,
    newPhotos,
    priceInCents,
    stock,
  }: UpdateProductInput): Promise<Output> {
    try {
      const product = await this.productsRepository.findById(productId);

      if (!product) {
        this.logger.warn(`Produto com ID ${productId} não encontrado`);
        return left(new ProductNotFoundError(productId));
      }

      if (product.artisanId !== authorId) {
        this.logger.warn(
          `Usuário ${authorId} tentou atualizar produto ${productId} sem permissão`,
        );
        return left(new NotAllowedError());
      }

      if (title) {
        product.title = title;
      }

      if (description) {
        product.description = description;
      }

      if (priceInCents !== undefined) {
        product.priceInCents = BigInt(priceInCents);
      }

      if (stock !== undefined) {
        product.stock = stock;
      }

      const hasDeletedAllPhotos = product.photos.map(
        (p) => p.attachmentId,
      ).every((id) => deletedPhotos?.includes(id));

      if (hasDeletedAllPhotos && (!newPhotos || newPhotos.length === 0) && !coverPhotoId) {
        this.logger.warn(
          `Usuário ${authorId} tentou atualizar produto ${productId} removendo todas as fotos`,
        );
        return left(new InvalidProductDataError('Um produto deve ter ao menos uma foto ou uma foto de capa'));
      }

      if (deletedPhotos && deletedPhotos.length > 0) {
        this.logger.log(`Removendo ${deletedPhotos.length} fotos do produto`);
        await this.attachmentsRepository.deleteMany(deletedPhotos);
      }

      const photosUrls: string[] = [];

      if (newPhotos && newPhotos.length > 0) {
        this.logger.log(`Adicionando ${newPhotos.length} novas fotos ao produto`);

        const photoPromises = newPhotos.map(async (photo) => {
          await this.validateAndLinkAttachments(newPhotos, product.id);
          const url = await this.s3StorageService.getUrlByFileName(photo);
          return url;
        });

        photosUrls.push(...(await Promise.all(photoPromises)));
      }

      let coverPhoto: string | undefined;
      if (coverPhotoId) {
        coverPhoto = await this.s3StorageService.getUrlByFileName(coverPhotoId);
        product.coverImageId = coverPhotoId;
      }

      await this.prisma.product.update({
        where: { id: product.id },
        data: {
          title: product.title,
          description: product.description,
          priceInCents: product.priceInCents,
          stock: product.stock,
          categoryIds: product.categoryIds,
          coverImageId: product.coverImageId,
          updatedAt: new Date(),
        },
      });

      const allPhotosUrls = product.photos
        ? await Promise.all(
          product
            .photos
            .map((photo) => this.s3StorageService.getUrlByFileName(photo.attachmentId)),
        )
        : [];

      this.logger.log(`Produto com ID ${productId} atualizado com sucesso`);

      return right({
        id: product.id,
        authorId: product.artisanId,
        title: product.title,
        description: product.description,
        priceInCents: Number(product.priceInCents),
        stock: product.stock,
        categoryIds: product.categoryIds.map(Number),
        photos: allPhotosUrls,
        coverPhoto,
      });
    } catch (error) {
      this.logger.error(
        `Erro ao atualizar produto com ID ${productId}: ${error.message}`,
        error.stack,
      );

      return left(error);
    }
  }

  private async validateAndLinkAttachments(
    attachmentIds: string[],
    productId: string,
  ): Promise<Either<InvalidAttachmentError, void>> {
    try {
      const attachments = await Promise.all(
        attachmentIds.map((attachmentId) => this.attachmentsRepository.findById(attachmentId)),
      );

      for (let i = 0; i < attachments.length; i += 1) {
        const attachment = attachments[i];
        const attachmentId = attachmentIds[i];

        if (!attachment) {
          this.logger.warn(`Attachment not found: ${attachmentId}`);
          return left(new InvalidAttachmentError(`Imagem não encontrada: ${attachmentId}`));
        }

        if (attachment.productId && attachment.productId !== productId) {
          this.logger.warn(`Attachment already linked: ${attachmentId}`);
          return left(new InvalidAttachmentError('Uma das imagens já está vinculada a outro produto'));
        }
      }

      await this.attachmentsRepository.linkToProduct(attachmentIds, productId);

      this.logger.log(`Linked ${attachmentIds.length} attachments to product ${productId}`);

      return right(undefined);
    } catch (error) {
      this.logger.error('Error validating/linking attachments:', error);
      return left(new InvalidAttachmentError('Erro ao processar as imagens'));
    }
  }
}
