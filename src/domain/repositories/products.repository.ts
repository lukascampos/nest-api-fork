/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';
import { Product } from '@prisma/client';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { ListProductsInput } from '../products/core/use-cases/list-products.use-case';

export interface FindPopularByPeriodParams {
  startDate: Date;
  endDate: Date;
  limit: number;
}

export interface FindByFollowedArtisansParams {
  userId: string;
  limit: number;
}

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

  async findRecentWithArtisan(limit: number): Promise<Partial<Product>[]> {
    return this.prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        priceInCents: true,
        likesCount: true,
        viewsCount: true,
        coverImageId: true,
        artisanId: true,
        createdAt: true,
      },
    });
  }

  async findPopularByPeriodWithArtisan({
    startDate,
    endDate,
    limit,
  }: FindPopularByPeriodParams): Promise<any[]> {
    const result = await this.prisma.$queryRaw<any[]>`
    SELECT 
      p.id,
      p.title,
      p.slug,
      p.price_in_cents as "priceInCents",
      p.likes_count as "likesCount",
      p.views_count as "viewsCount",
      p.fk_cover_image_id as "coverImageId",
      p.fk_artisan_id as "artisanId",
      p.created_at as "createdAt",
      COUNT(DISTINCT pl.id) as recent_likes
    FROM products p
    LEFT JOIN product_likes pl ON p.id = pl.fk_product_id
      AND pl.created_at >= ${startDate}
      AND pl.created_at <= ${endDate}
    WHERE p.is_active = true
    GROUP BY p.id
    ORDER BY recent_likes DESC, p.created_at DESC
    LIMIT ${limit}
  `;

    return result;
  }

  async findByFollowedArtisansWithArtisan({
    userId,
    limit,
  }: FindByFollowedArtisansParams): Promise<any[]> {
    const result = await this.prisma.$queryRaw<any[]>`
    SELECT 
      p.id,
      p.title,
      p.slug,
      p.price_in_cents as "priceInCents",
      p.likes_count as "likesCount",
      p.views_count as "viewsCount",
      p.fk_cover_image_id as "coverImageId",
      p.fk_artisan_id as "artisanId",
      p.created_at as "createdAt"
    FROM products p
    INNER JOIN artisan_followers af ON p.fk_artisan_id = af.fk_following_id
    WHERE af.fk_follower_id = ${userId}
      AND p.is_active = true
    ORDER BY p.created_at DESC
    LIMIT ${limit}
  `;

    return result;
  }
}
