import { Injectable, Logger } from '@nestjs/common';
import { ArtisanProfile, Product, User } from '@prisma/client';
import { Either, left, right } from '@/domain/_shared/utils/either';
import { ProductsRepository } from '@/domain/repositories/products.repository';
import { ArtisanProfilesRepository } from '@/domain/repositories/artisan-profiles.repository';
import { S3StorageService } from '@/domain/attachments/s3-storage.service';
import { UsersRepository } from '@/domain/repositories/users.repository';

export interface GetHomeFeedInput {
  userId?: string;
  limit?: number;
}

export interface ProductSummary {
  id: string;
  title: string;
  slug: string;
  priceInCents: number;
  likesCount: number;
  viewsCount: number;
  coverPhoto?: string;
  artisan: {
    id: string;
    name: string;
    userName: string;
    avatar?: string;
  };
}

export interface ArtisanSummary {
  id: string;
  name: string;
  userName: string;
  avatar?: string;
  productsCount: number;
  followersCount: number;
  bio?: string;
}

export interface GetHomeFeedOutput {
  popularProducts: ProductSummary[];
  recentProducts: ProductSummary[];
  newArtisans: ArtisanSummary[];
  followedArtisansProducts: ProductSummary[];
}

type Output = Either<Error, GetHomeFeedOutput>;

@Injectable()
export class GetHomeFeedUseCase {
  private readonly logger = new Logger(GetHomeFeedUseCase.name);

  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly artisanProfilesRepository: ArtisanProfilesRepository,
    private readonly usersRepository: UsersRepository,
    private readonly s3StorageService: S3StorageService,
  ) {}

  async execute({ userId, limit = 10 }: GetHomeFeedInput): Promise<Output> {
    try {
      this.logger.log('Fetching home feed data', { userId, limit });

      const [
        popularProducts,
        recentProducts,
        newArtisans,
        followedArtisansProducts,
      ] = await Promise.all([
        this.getPopularProducts(limit),
        this.getRecentProducts(limit),
        this.getNewArtisans(limit),
        userId ? this.getFollowedArtisansProducts(userId, limit) : Promise.resolve([]),
      ]);

      this.logger.log('Home feed data fetched successfully', {
        popularCount: popularProducts.length,
        recentCount: recentProducts.length,
        newArtisansCount: newArtisans.length,
        followedCount: followedArtisansProducts.length,
      });

      return right({
        popularProducts,
        recentProducts,
        newArtisans,
        followedArtisansProducts,
      });
    } catch (error) {
      this.logger.error('Error fetching home feed', error.stack);
      return left(new Error('Failed to fetch home feed'));
    }
  }

  private async getPopularProducts(limit: number): Promise<ProductSummary[]> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const products = await this.productsRepository.findPopularByPeriodWithArtisan({
      startDate: sevenDaysAgo,
      endDate: new Date(),
      limit,
    });

    return this.mapProductsToSummary(products);
  }

  private async getRecentProducts(limit: number): Promise<ProductSummary[]> {
    const products = await this.productsRepository.findRecentWithArtisan(limit);
    return this.mapProductsToSummary(products as Product[]);
  }

  private async getNewArtisans(limit: number): Promise<ArtisanSummary[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const artisans = await this.artisanProfilesRepository.findNewWithProducts({
      startDate: thirtyDaysAgo,
      minProducts: 1,
      limit,
    });

    if (artisans.length === 0) {
      return [];
    }

    const userIds = artisans.map((a) => a.userId);
    const users = await this.usersRepository.findManyByIdsWithoutFilter(userIds);
    const usersMap = new Map(users.map((u) => [u.id, u]));

    return Promise.all(
      artisans.map(async (artisan) => {
        const user = usersMap.get(artisan.userId);
        const avatarUrl = user?.avatar
          ? await this.s3StorageService.getUrlByFileName(user.avatar)
          : undefined;

        return {
          id: artisan.userId,
          name: user?.name || artisan.comercialName || 'Unknown Artisan',
          userName: artisan.artisanUserName,
          avatar: avatarUrl,
          productsCount: artisan.productsCount || 0,
          followersCount: artisan.followersCount || 0,
          bio: artisan.bio || undefined,
        };
      }),
    );
  }

  private async getFollowedArtisansProducts(
    userId: string,
    limit: number,
  ): Promise<ProductSummary[]> {
    const products = await this.productsRepository.findByFollowedArtisansWithArtisan({
      userId,
      limit,
    });

    return this.mapProductsToSummary(products as Product[]);
  }

  private async mapProductsToSummary(
    products: Product[],
  ): Promise<ProductSummary[]> {
    if (!products || products.length === 0) {
      return [];
    }

    const artisanIds = [...new Set(products.map((p) => p.artisanId))];

    const [artisansMap, usersMap] = await Promise.all([
      this.getArtisansMap(artisanIds),
      this.getUsersMap(artisanIds),
    ]);

    return Promise.all(
      products.map(async (product) => {
        const artisan = artisansMap.get(product.artisanId);
        const user = usersMap.get(product.artisanId);

        const coverPhotoUrl = product.coverImageId
          ? await this.s3StorageService.getUrlByFileName(product.coverImageId)
          : undefined;

        const avatarUrl = user?.avatar
          ? await this.s3StorageService.getUrlByFileName(user.avatar)
          : undefined;

        return {
          id: product.id,
          title: product.title,
          slug: product.slug,
          priceInCents: Number(product.priceInCents),
          likesCount: product.likesCount || 0,
          viewsCount: product.viewsCount || 0,
          coverPhoto: coverPhotoUrl,
          artisan: {
            id: product.artisanId,
            name: user?.name || artisan?.comercialName || 'Unknown',
            userName: artisan?.artisanUserName || 'unknown',
            avatar: avatarUrl,
          },
        };
      }),
    );
  }

  private async getArtisansMap(artisanIds: string[]): Promise<Map<string, ArtisanProfile>> {
    if (artisanIds.length === 0) return new Map();

    const artisans = await this.artisanProfilesRepository.findManyByUserIds(artisanIds);
    return new Map(artisans.map((a) => [a.userId, a]));
  }

  private async getUsersMap(userIds: string[]): Promise<Map<string, Partial<User>>> {
    if (userIds.length === 0) return new Map();

    const users = await this.usersRepository.findManyByIdsWithoutFilter(userIds);
    return new Map(users.map((u) => [u.id, u]));
  }
}
