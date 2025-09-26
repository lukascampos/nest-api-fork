import { Injectable } from '@nestjs/common';
import { Product } from '@prisma/client';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { ListProductsInput } from '../products/core/use-cases/list-products.use-case';

@Injectable()
export class ProductsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllCategories() {
    return this.prisma.productCategory.findMany({
      orderBy: { nameFilter: 'asc' },
    });
  }

  async findRawMaterialsByIds(ids: number[]) {
    return this.prisma.rawMaterial.findMany({
      where: { id: { in: ids } },
      orderBy: { nameFilter: 'asc' },
    });
  }

  async findTechniquesByIds(ids: number[]) {
    return this.prisma.technique.findMany({
      where: { id: { in: ids } },
      orderBy: { nameFilter: 'asc' },
    });
  }

  async findBySlug(slug: string) {
    return this.prisma.product.findUnique({
      where: { slug },
    });
  }

  async list({
    artisanId,
    categoryId,
    id,
    title,
  }: ListProductsInput): Promise<Product[]> {
    const productsWithPhotos = await this.prisma.product.findMany({
      where: {
        artisanId,
        categoryIds: categoryId ? { has: BigInt(categoryId) } : undefined,
        id,
        title: title ? { contains: title, mode: 'insensitive' } : undefined,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        images: true,
      },
    });

    return productsWithPhotos.map((product) => ({
      ...product,
      photos: product.images.map((photo) => ({
        attachmentId: photo.id,
        productId: photo.productId!,
      })),
    }));
  }
}
