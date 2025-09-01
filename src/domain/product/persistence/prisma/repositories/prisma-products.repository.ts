import { Injectable } from '@nestjs/common';
import { ProductPhoto } from '@/domain/product/core/entities/product-photo.entity';
import { Product } from '@/domain/product/core/entities/product.entity';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { PrismaProductPhotosRepository } from './prisma-product-photos.repository';
import { PrismaProductsMapper } from '../mappers/prisma-products.mapper';
import { ListProductsInput } from '@/domain/product/core/use-cases/list-products.use-case';

@Injectable()
export class PrismaProductsRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productPhotosRepository: PrismaProductPhotosRepository,
  ) {}

  async findById(id: string): Promise<Product | null> {
    const productsWithoutPhotos = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!productsWithoutPhotos) {
      return null;
    }

    const photos = await this.prisma.attachment.findMany({
      where: { productId: id },
    });

    const productPhotos = photos.map((photo) => ProductPhoto.create({
      attachmentId: photo.id,
      productId: photo.productId!,
    }));

    const [likesCount, averageRating] = await Promise.all([
      this.prisma.productLike.count({
        where: { productId: id },
      }),
      this.prisma.productRating.aggregate({
        _avg: { rating: true },
        where: { productId: id },
      }),
    ]);

    return PrismaProductsMapper.toDomain(
      productsWithoutPhotos,
      productPhotos,
      likesCount,
      averageRating._avg.rating,
    );
  }

  async list({
    artisanId, categoryId, id, title,
  }: ListProductsInput): Promise<Product[]> {
    const productsWithoutPhotos = await this.prisma.product.findMany({
      where: {
        artisanId,
        categoryId,
        id,
        title: title ? { contains: title, mode: 'insensitive' } : undefined,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (productsWithoutPhotos.length === 0) {
      return [];
    }

    const productIds = productsWithoutPhotos.map((product) => product.id);
    const photos = await this.prisma.attachment.findMany({
      where: { productId: { in: productIds } },
    });
    if (photos.length === 0) {
      return [];
    }
    return productsWithoutPhotos.map((product) => {
      const productPhotos = photos
        .filter((photo) => photo.productId === product.id)
        .map((photo) => ProductPhoto.create({
          attachmentId: photo.id,
          productId: photo.productId!,
        }));
      return PrismaProductsMapper.toDomain(
        product,
        productPhotos,
      );
    });
  }

  async save(product: Product): Promise<void> {
    const productData = {
      id: product.id,
      artisanId: product.artisanId,
      title: product.title,
      description: product.description,
      priceInCents: product.priceInCents,
      categoryId: product.categoryId,
      stock: product.stock,
      coverageImage: product.coverPhotoId,
      updatedAt: new Date(),
    };

    await this.prisma.$transaction(async (tx) => {
      const productExists = await tx.product.findUnique({
        where: { id: product.id },
      });
      if (!productExists) {
        await tx.product.create({ data: productData });

        if (product.photos) {
          await this.productPhotosRepository.createManyWithTx(tx, product.photos.getItems());
        }
      } else {
        await tx.product.update({ where: { id: product.id }, data: productData });
        await Promise.all([
          this.productPhotosRepository.createManyWithTx(tx, product.photos!.getNewItems()),
          this.productPhotosRepository.deleteManyWithTx(tx, product.photos!.getRemovedItems()),
        ]);
      }
    });

    const countProductByArtisan = await this.prisma.product.count({
      where: { artisanId: productData.artisanId },
    });

    await this.prisma.artisanProfile.update({
      where: { userId: product.artisanId },
      data: { productsCount: countProductByArtisan },
    });
  }
}
