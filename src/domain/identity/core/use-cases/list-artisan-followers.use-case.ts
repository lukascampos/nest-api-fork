import { Injectable, Logger } from '@nestjs/common';
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
  private readonly logger = new Logger(ListArtisanFollowersUseCase.name);

  constructor(
        private readonly prisma: PrismaService,
        private readonly artisanFollowersRepository: ArtisanFollowersRepository,
  ) {}

  async execute(input: ListArtisanFollowersInput): Promise<ListArtisanFollowersResult> {
    const { artisanId } = input;
    const page = Number(input.page ?? 1);
    const limit = Number(input.limit ?? 10);
    const skip = (page - 1) * limit;
    const startedAt = Date.now();

    this.logger.debug('list-followers started', { artisanId: input.artisanId, page, limit });

    try {
      const target = await this.prisma.user.findUnique({
        where: { id: artisanId },
        include: { ArtisanProfile: true },
      });

      if (!target) {
        this.logger.warn('artisan not found', { artisanId: input.artisanId });
        return left(new UserNotFoundError(artisanId, 'id'));
      }

      if (!target.ArtisanProfile) {
        this.logger.warn('target is not artisan', { artisanId: input.artisanId });
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

      this.logger.debug(`list-followers done in ${Date.now() - startedAt}ms`, {
        artisanId: input.artisanId, page, limit, total,
      });

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
      this.logger.error(`list-followers failed in ${Date.now() - startedAt}ms`, error instanceof Error ? error.stack : undefined, { artisanId: input.artisanId, page, limit });
      return left(error as Error);
    }
  }
}
