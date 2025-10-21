import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@/domain/_shared/utils/either';
import { UserNotFoundError } from '../errors/user-not-found.error';
import { PrismaService } from '@/shared/prisma/prisma.service';

type ListArtisanFollowingInput = {
    userId: string;
    page?: number;
    limit?: number;
}

type FollowingItem = {
    id: string;
    createdAt: Date;
    artisan: {
        id: string;
        name: string;
        avatar: string | null;
        artisanUserName: string;
        bio: string | null;
        followersCount: number;
        productsCount: number;
    };
}

type ListArtisanFollowingOutput = {
    following: FollowingItem[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalpages: number;
    }
}

type ListArtisanFollowingResult = Either<
    UserNotFoundError | Error,
    ListArtisanFollowingOutput>;

@Injectable()
export class ListArtisanFollowingUseCase {
  constructor(
        private readonly prisma: PrismaService,
  ) {}

  async execute(input: ListArtisanFollowingInput): Promise<ListArtisanFollowingResult> {
    const page = Number(input.page ?? 1);
    const limit = Number(input.limit ?? 10);
    const skip = (page - 1) * limit;

    try {
      const user = await this.prisma.user.findUnique({
        where: { id: input.userId },
        select: { id: true },
      });

      if (!user) {
        return left(new UserNotFoundError(input.userId, 'id'));
      }

      const [total, rows] = await this.prisma.$transaction([
        this.prisma.artisanFollower.count({
          where: { followerId: input.userId },
        }),
        this.prisma.artisanFollower.findMany({
          where: { followerId: input.userId },
          include: {
            following: {
              select: {
                id: true,
                name: true,
                avatar: true,
                ArtisanProfile: {
                  select: {
                    artisanUserName: true,
                    bio: true,
                    followersCount: true,
                    productsCount: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
      ]);
      const following: FollowingItem[] = rows.map((r) => ({
        id: r.id,
        createdAt: r.createdAt,
        artisan: {
          id: r.following.id,
          name: r.following?.name ?? '',
          avatar: r.following?.avatar ?? null,
          artisanUserName: r.following.ArtisanProfile?.artisanUserName ?? '',
          bio: r.following.ArtisanProfile?.bio ?? null,
          followersCount: r.following?.ArtisanProfile?.followersCount ?? 0,
          productsCount: r.following?.ArtisanProfile?.productsCount ?? 0,
        },
      }));
      const totalPages = Math.max(1, Math.ceil(total / limit));
      return right({
        following,
        pagination: {
          page,
          limit,
          total,
          totalpages: totalPages,
        },
      });
    } catch (error) {
      return left(error as Error);
    }
  }
}
