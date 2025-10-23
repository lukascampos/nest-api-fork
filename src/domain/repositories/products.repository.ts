import { Injectable } from '@nestjs/common';
import { Prisma, Product } from '@prisma/client';
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

  async save(product: Product): Promise<void> {
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

  async findById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
        coverImage: true,
        ratings: true,
        likes: true,
        artisan: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!product) {
      return null;
    }

    const likesCount = product.likes.length;
    const averageRating = product.ratings.length > 0
      ? product.ratings.reduce((sum, rating) => sum + rating.rating, 0) / product.ratings.length
      : null;

    return {
      id: product.id,
      artisanId: product.artisanId,
      categoryIds: product.categoryIds,
      title: product.title,
      description: product.description,
      priceInCents: product.priceInCents,
      stock: product.stock,
      coverImageId: product.coverImageId,
      isActive: product.isActive,
      slug: product.slug,
      viewsCount: product.viewsCount,
      likesCount,
      averageRating,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      photos: product.images.map((image) => ({
        attachmentId: image.id,
        productId: image.productId!,
      })),
      artisan: {
        id: product.artisan.id,
        userId: product.artisan.userId,
        userName: product.artisan.artisanUserName,
        bio: product.artisan.bio,
        user: {
          id: product.artisan.user.id,
          name: product.artisan.user.name,
          email: product.artisan.user.email,
        },
      },
    };
  }

  async findByIdCore(
    id: string,
    tx?: Prisma.TransactionClient,
  ): Promise<{ id: string; isActive: boolean; artisanId: string } | null> {
    const db = (tx ?? this.prisma);

    const row = await db.product.findUnique({
      where: { id },
      select: { id: true, isActive: true, artisanId: true },
    });

    return row ?? null;
  }

  async updateAverageRating(
    params: { productId: string; averageRating: number | null },
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const { productId, averageRating } = params;
    const db = (tx ?? this.prisma) as Prisma.TransactionClient | PrismaService;

    await db.product.update({
      where: { id: productId },
      data: { averageRating },
    });
  }
}
