import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { ArtisanFollowersRepository } from '@/domain/repositories/artisan-followers.repository';
import { Either, right, left } from '@/domain/_shared/utils/either';
import { CannotFollowSelfError } from '../errors/cannot-follow-self.error';
import { TargetNotArtisanError } from '../errors/target-not-artisan.error';
import { UserNotFoundError } from '../errors/user-not-found.error';

type ToggleArtisanFollowInput = {
  followerId: string;
  followingId: string;
}

type ToggleArtisanFollowOutput = {
  action: 'followed' | 'unfollowed';
  followersCount: number;
}

type ToggleArtisanFollowResult = Either< CannotFollowSelfError
  | TargetNotArtisanError | UserNotFoundError, ToggleArtisanFollowOutput>;

@Injectable()
export class ToggleArtisanFollowUseCase {
  private readonly logger = new Logger(ToggleArtisanFollowUseCase.name);

  constructor(
        private readonly artisanFollowersRepository: ArtisanFollowersRepository,
        private readonly prisma: PrismaService,
  ) {}

  async execute(input: ToggleArtisanFollowInput): Promise<ToggleArtisanFollowResult> {
    const { followerId, followingId } = input;
    const startedAt = Date.now();

    this.logger.log('toggle started', { followerId, followingId });

    try {
      if (followerId === followingId) {
        this.logger.warn('cannot follow self', { followerId });
        return left(new CannotFollowSelfError());
      }

      const target = await this.prisma.user.findUnique({
        where: { id: followingId },
        include: { ArtisanProfile: true },
      });

      if (!target) {
        this.logger.warn('target user not found', { followingId });
        return left(new UserNotFoundError(followingId, 'id'));
      }

      if (!target?.ArtisanProfile) {
        this.logger.warn('target is not artisan', { followingId });
        return left(new TargetNotArtisanError());
      }

      const payload = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const existing = await this.artisanFollowersRepository.findByUserIds(
          { followerId, followingId },
          tx,
        );

        if (existing) {
          await this.artisanFollowersRepository.delete({ followerId, followingId }, tx);

          const updated = await tx.artisanProfile.update({
            where: { userId: followingId },
            data: { followersCount: { decrement: 1 } },
            select: { followersCount: true },
          });

          return {
            action: 'unfollowed' as const,
            followersCount: updated.followersCount,
          };
        }

        await this.artisanFollowersRepository.create({ followerId, followingId }, tx);

        const updated = await tx.artisanProfile.update({
          where: { userId: followingId },
          data: { followersCount: { increment: 1 } },
          select: { followersCount: true },
        });

        return {
          action: 'followed' as const,
          followersCount: updated.followersCount,
        };
      });
      this.logger.log(`toggle done in ${Date.now() - startedAt}ms`, {
        followerId, followingId, action: payload.action, followersCount: payload.followersCount,
      });
      return right(payload);
    } catch (error) {
      this.logger.error(`toggle failed in ${Date.now() - startedAt}ms`, error instanceof Error ? error.stack : undefined, { followerId, followingId });
      return left(error as Error);
    }
  }
}
