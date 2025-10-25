import { Injectable, Logger } from '@nestjs/common';
import { ProductCategory } from '@prisma/client';
import slugify from 'slugify';
import { Either, left, right } from '@/domain/_shared/utils/either';
import { ArtisanProfilesRepository } from '@/domain/repositories/artisan-profiles.repository';
import { ProductsRepository } from '@/domain/repositories/products.repository';
import { AttachmentsRepository } from '@/domain/repositories/attachments.repository';
import { UserNotFoundError } from '@/domain/identity/core/errors/user-not-found.error';
import { InvalidProductDataError } from '../errors/invalid-product-data.error';
import { InvalidAttachmentError } from '@/domain/identity/core/errors/invalid-attachment.error';
import { PrismaService } from '@/shared/prisma/prisma.service';

export interface CreateProductInput {
  artisanId: string;
  title: string;
  description: string;
  priceInCents: number;
  rawMaterialIds: number[];
  techniqueIds: number[];
  stock: number;
  photosIds: string[];
}

export interface CreateProductOutput {
  id: string;
  slug: string;
}

type Output = Either<Error, CreateProductOutput>;

@Injectable()
export class CreateProductUseCase {
  private readonly logger = new Logger(CreateProductUseCase.name);

  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly artisanProfilesRepository: ArtisanProfilesRepository,
    private readonly attachmentsRepository: AttachmentsRepository,
    private readonly prisma: PrismaService,
  ) {
    this.logger.log('CreateProductUseCase initialized');
  }

  async execute({
    artisanId,
    title,
    description,
    priceInCents,
    rawMaterialIds,
    techniqueIds,
    stock,
    photosIds,
  }: CreateProductInput): Promise<Output> {
    try {
      const [
        artisan,
        categories,
        rawMaterials,
        techniques,
        attachments,
      ] = await Promise.all([
        this.artisanProfilesRepository.findByUserId(artisanId),
        this.productsRepository.findAllCategories(),
        this.productsRepository.findRawMaterialsByIds(rawMaterialIds),
        this.productsRepository.findTechniquesByIds(techniqueIds),
        photosIds.length > 0
          ? this.attachmentsRepository.findManyByIds(photosIds)
          : Promise.resolve([]),
      ]);

      if (!artisan) {
        return left(new UserNotFoundError(artisanId, 'id'));
      }

      if (artisan.isDisabled) {
        return left(new UserNotFoundError(artisanId, 'id'));
      }

      if (rawMaterials.length !== rawMaterialIds.length) {
        const missing = rawMaterialIds.filter(
          (id) => !rawMaterials.find((m) => Number(m.id) === id),
        );
        return left(new InvalidProductDataError(`Matérias-primas não encontradas: ${missing.join(', ')}`));
      }

      if (techniques.length !== techniqueIds.length) {
        const missing = techniqueIds.filter((id) => !techniques.find((t) => Number(t.id) === id));
        return left(new InvalidProductDataError(`Técnicas não encontradas: ${missing.join(', ')}`));
      }

      const matchingCategories = this.findMatchingCategories(
        categories,
        rawMaterialIds,
        techniqueIds,
      );

      if (matchingCategories.length === 0) {
        return left(new InvalidProductDataError('Nenhuma categoria de produto corresponde às matérias-primas e técnicas fornecidas'));
      }

      const slug = await this.generateUniqueSlug(title);

      const result = await this.prisma.$transaction(async (tx) => {
        const product = await tx.product.create({
          data: {
            artisanId,
            categoryIds: matchingCategories.filter((c) => c !== null).map((c) => c!.id),
            title,
            description,
            priceInCents,
            stock,
            coverImageId: photosIds[0],
            slug,
            isActive: true,
            likesCount: 0,
            viewsCount: 0,
            averageRating: null,
          },
          select: {
            id: true,
            slug: true,
          },
        });

        await tx.artisanProfile.update({
          where: { id: artisan.id },
          data: {
            productsCount: { increment: 1 },
          },
        });

        return { product };
      });

      const attachmentLinking = await this.validateAndLinkAttachments(
        attachments.map((a) => a.id),
        result.product.id,
      );

      if (attachmentLinking.isLeft()) {
        return left(attachmentLinking.value);
      }

      this.logger.log(`Product created successfully: ${result} with categories: ${matchingCategories.map((c) => c!.id).join(', ')}`);

      return right({
        id: result.product.id,
        slug: result.product.slug,
      });
    } catch (error) {
      this.logger.error('Error creating product:', {
        error: error.message,
        stack: error.stack,
        code: error.code,
      });

      // Tratamento específico de erros do Prisma
      if (error.code === 'P2002') {
        return left(new InvalidProductDataError('Já existe um produto com este título'));
      }

      if (error.code === 'P2003') {
        return left(new InvalidProductDataError('Referência inválida nos dados fornecidos'));
      }

      return left(new Error('Erro interno do servidor'));
    }
  }

  private findMatchingCategories(
    categories: ProductCategory[],
    rawMaterialIds: number[],
    techniqueIds: number[],
  ) {
    const matchingCategories = categories.map((categorie) => {
      const categoryRawMaterialIds = categorie.rawMaterialIds.map((id) => id);
      const categoryTechniqueIds = categorie.techniqueIds.map((id) => id);

      const hasAnyRawMaterial = rawMaterialIds.some(
        (id) => categoryRawMaterialIds.includes(BigInt(id)),
      );
      const hasAnyTechnique = techniqueIds.some(
        (id) => categoryTechniqueIds.includes(BigInt(id)),
      );

      if (hasAnyRawMaterial || hasAnyTechnique) {
        return categorie;
      }
      return undefined;
    });

    return matchingCategories.splice(0).filter((c) => c !== undefined);
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

  private async generateUniqueSlug(baseTitle: string): Promise<string> {
    const slugBase = slugify(baseTitle, { lower: true });
    let productSlug = slugBase;
    let counter = 1;

    let existingProductSlug = await this.productsRepository.findBySlug(productSlug);

    while (existingProductSlug) {
      productSlug = `${slugBase}-${counter}`;
      counter += 1;
      // eslint-disable-next-line no-await-in-loop
      existingProductSlug = await this.productsRepository.findBySlug(productSlug);
    }

    return productSlug;
  }
}
