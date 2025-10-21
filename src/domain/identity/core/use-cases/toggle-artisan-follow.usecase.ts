import { Injectable } from '@nestjs/common';
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
  constructor(
        private readonly artisanFollowersRepository: ArtisanFollowersRepository,
        private readonly prisma: PrismaService,
  ) {}

  async execute(input: ToggleArtisanFollowInput): Promise<ToggleArtisanFollowResult> {
    const { followerId, followingId } = input;
    try {
      if (followerId === followingId) {
        return left(new CannotFollowSelfError());
      }

      const target = await this.prisma.user.findUnique({
        where: { id: followingId },
        include: { ArtisanProfile: true },
      });

      if (!target) {
        return left(new UserNotFoundError(followingId, 'id'));
      }

      if (!target?.ArtisanProfile) {
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

      return right(payload);
    } catch (error) {
      return left(error as Error);
    }
  }
}
