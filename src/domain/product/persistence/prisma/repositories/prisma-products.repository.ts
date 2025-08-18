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

    if (!photos) {
      return null;
    }

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

    if (!productsWithoutPhotos) {
      return [];
    }

    const productIds = productsWithoutPhotos.map((product) => product.id);
    const photos = await this.prisma.attachment.findMany({
      where: { productId: { in: productIds } },
    });
    if (!photos) {
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
      artisanId: product.artisanId,
      title: product.title,
      description: product.description,
      priceInCents: product.priceInCents,
      categoryId: product.categoryId,
      stock: product.stock,
      coverageImage: product.coverPhotoId,
    };

    const productExists = await this.prisma.product.findUnique({
      where: { id: product.id },
    });

    if (!productExists) {
      await this.prisma.product.create({
        data: {
          ...productData,
          id: product.id,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
        },
      });

      if (product.photos) {
        await this.productPhotosRepository.createMany(product.photos.getItems());
      }

      return;
    }

    await this.prisma.product.update({
      where: { id: product.id },
      data: {
        ...productData,
        updatedAt: new Date(),
      },
    });

    await Promise.all([
      this.productPhotosRepository.createMany(
        product.photos!.getNewItems(),
      ),
      this.productPhotosRepository.deleteMany(
        product.photos!.getRemovedItems(),
      ),
    ]);
  }
}
