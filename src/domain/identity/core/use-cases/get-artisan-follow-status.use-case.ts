import { Injectable } from '@nestjs/common';
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

type GetAtisanFollowStatusResult = Either<
    TargetNotArtisanError | Error,
    GetArtisanFollowStatusOutput
>;

@Injectable()
export class GetArtisanFollowStatusUseCase {
  constructor(
        private readonly prisma: PrismaService,
        private readonly artisanFollowersRepository: ArtisanFollowersRepository,
  ) {}

  async execute(input: GetArtisanFollowStatusInput): Promise<GetAtisanFollowStatusResult> {
    const { currentUserId, artisanId } = input;

    try {
      const target = await this.prisma.user.findUnique({
        where: { id: artisanId },
        include: { ArtisanProfile: true },
      });

      if (!target) {
        return left(new UserNotFoundError(artisanId, 'id'));
      }

      if (!target?.ArtisanProfile) {
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

      return right({
        isFollowing: !!followRelation,
        followersCount,
        followedAt: followRelation?.createdAt ?? null,
      });
    } catch (error) {
      return left(error as Error);
    }
  }
}
