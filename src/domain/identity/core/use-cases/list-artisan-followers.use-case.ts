import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@/domain/_shared/utils/either';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { TargetNotArtisanError } from '../errors/target-not-artisan.error';
import { UserNotFoundError } from '../errors/user-not-found.error';
import { ArtisanFollowersRepository } from '@/domain/repositories/artisan-followers.repository';

type ListArtisanFollowersInput = {
    artisanId: string;
    page?: number;
    limit?: number;
}

type FollowerItem = {
    id: string;
    createdAt: Date;
    follower: {
        id: string;
        name: string;
        avatar: string | null;
    };
};

type ListArtisanFollowersOutput = {
    followers: FollowerItem[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
};

type ListArtisanFollowersResult = Either<
    UserNotFoundError | TargetNotArtisanError | Error,
    ListArtisanFollowersOutput>;

@Injectable()
export class ListArtisanFollowersUseCase {
  constructor(
        private readonly prisma: PrismaService,
        private readonly artisanFollowersRepository: ArtisanFollowersRepository,
  ) {}

  async execute(input: ListArtisanFollowersInput): Promise<ListArtisanFollowersResult> {
    const { artisanId } = input;
    const page = Number(input.page ?? 1);
    const limit = Number(input.limit ?? 10);
    const skip = (page - 1) * limit;

    try {
      const target = await this.prisma.user.findUnique({
        where: { id: artisanId },
        include: { ArtisanProfile: true },
      });

      if (!target) {
        return left(new UserNotFoundError(artisanId, 'id'));
      }

      if (!target.ArtisanProfile) {
        return left(new TargetNotArtisanError());
      }

      const [total, rows] = await this.prisma.$transaction([
        this.prisma.artisanFollower.count({ where: { followingId: artisanId } }),
        this.prisma.artisanFollower.findMany({
          where: { followingId: artisanId },
          include: {
            follower: {
              select: { id: true, name: true, avatar: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
      ]);

      const followers: FollowerItem[] = rows.map((r) => ({
        id: r.id,
        createdAt: r.createdAt,
        follower: {
          id: r.followerId,
          name: r.follower?.name ?? '',
          avatar: r.follower?.avatar ?? null,
        },
      }));

      const totalPages = Math.max(1, Math.ceil(total / limit));

      return right({
        followers,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      });
    } catch (error) {
      return left(error as Error);
    }
  }
}
