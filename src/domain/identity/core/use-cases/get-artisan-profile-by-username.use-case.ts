import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@/domain/_shared/utils/either';
import { UserNotFoundError } from '../errors/user-not-found.error';
import { PrismaUsersRepository } from '../../persistence/prisma/repositories/prisma-users.repository';
import { PrismaArtisanProfilesRepository } from '../../persistence/prisma/repositories/prisma-artisan-profiles.repository';
import { ArtisanProfileNotFoundError } from '../errors/artisan-profile-not-found.error';
import { S3AttachmentsStorage } from '@/domain/_shared/attachments/persistence/storage/s3-attachments.storage';

export interface GetArtisanProfileByUsernameInput {
  username: string;
}

export interface GetArtisanProfileByUsernameOutput {
  userId: string;
  artisanName: string;
  userName: string;
  socialName: string | null;
  followersCount: number;
  productsCount: number;
  phoneNumber: string;
  email: string;
  bio: string | null;
  avatar: string | null;
}

type Output = Either<
  ArtisanProfileNotFoundError | UserNotFoundError,
  GetArtisanProfileByUsernameOutput
>;

@Injectable()
export class GetArtisanProfileByUsernameUseCase {
  constructor(
    private readonly artisanProfileRepository: PrismaArtisanProfilesRepository,
    private readonly usersRepository: PrismaUsersRepository,
    private readonly s3AttachmentsStorage: S3AttachmentsStorage,
  ) {}

  async execute({ username }: GetArtisanProfileByUsernameInput): Promise<Output> {
    const artisanProfile = await this
      .artisanProfileRepository
      .findByUsername(username);

    if (!artisanProfile) {
      return left(new ArtisanProfileNotFoundError(username));
    }

    const user = await this.usersRepository.findById(artisanProfile.userId);

    if (!user) {
      return left(new UserNotFoundError(artisanProfile.userId));
    }

    let avatar: string | null = null;

    if (user.avatarId) {
      avatar = await this.s3AttachmentsStorage.getUrlByFileName(user.avatarId);
    }

    return right({
      userId: artisanProfile.userId,
      artisanName: user.name,
      userName: artisanProfile.userName,
      socialName: user.socialName ?? null,
      followersCount: artisanProfile.followersCount,
      productsCount: artisanProfile.productsCount,
      phoneNumber: user.phone,
      email: user.email,
      bio: artisanProfile.bio,
      avatar,
    });
  }
}
