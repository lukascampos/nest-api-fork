import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { ArtisanFollowersRepository } from '@/domain/repositories/artisan-followers.repository';
import { Either, left, right } from '@/domain/_shared/utils/either';
import { TargetNotArtisanError } from '../errors/target-not-artisan.error';
import { UserNotFoundError } from '../errors/user-not-found.error';

type GetArtisanFollowStatusInput = {
    currentUserId: string;
    artisanId: string;
}

type GetArtisanFollowStatusOutput = {
    isFollowing: boolean;
    followersCount: number;
    followedAt?: Date | null;
}

type GetArtisanFollowStatusResult = Either<
    TargetNotArtisanError | Error,
    GetArtisanFollowStatusOutput
>;

@Injectable()
export class GetArtisanFollowStatusUseCase {
  private readonly logger = new Logger(GetArtisanFollowStatusUseCase.name);

  constructor(
        private readonly prisma: PrismaService,
        private readonly artisanFollowersRepository: ArtisanFollowersRepository,
  ) {}

  async execute(input: GetArtisanFollowStatusInput): Promise<GetArtisanFollowStatusResult> {
    const { currentUserId, artisanId } = input;
    const startedAt = Date.now();

    this.logger.debug('status started', { currentUserId, artisanId });

    try {
      const target = await this.prisma.user.findUnique({
        where: { id: artisanId },
        include: { ArtisanProfile: true },
      });

      if (!target) {
        this.logger.warn('artisan not found', { artisanId });
        return left(new UserNotFoundError(artisanId, 'id'));
      }

      if (!target?.ArtisanProfile) {
        this.logger.warn('target is not artisan', { artisanId });
        return left(new TargetNotArtisanError());
      }

      const
        {
          relation:
            followRelation,
          followersCount,
        } = await this.prisma.$transaction(async (tx) => {
          const relation = await this.artisanFollowersRepository.findByUserIds(
            { followerId: currentUserId, followingId: artisanId },
            tx,
          );

          const profile = await tx.artisanProfile.findUnique({
            where: { userId: artisanId },
            select: { followersCount: true },
          });

          return {
            relation,
            followersCount: profile?.followersCount ?? 0,
          };
        });

      this.logger.debug(`status done in ${Date.now() - startedAt}ms`, {
        currentUserId, artisanId, isFollowing: !!followRelation, followersCount,
      });

      return right({
        isFollowing: !!followRelation,
        followersCount,
        followedAt: followRelation?.createdAt ?? null,
      });
    } catch (error) {
      this.logger.error(`status failed in ${Date.now() - startedAt}ms`, error instanceof Error ? error.stack : undefined, { currentUserId, artisanId });
      return left(error as Error);
    }
  }
}
