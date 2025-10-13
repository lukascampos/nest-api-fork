import { Injectable, Logger } from '@nestjs/common';
import { Either, left, right } from '@/domain/_shared/utils/either';
import { UserNotFoundError } from '../errors/user-not-found.error';
import { ArtisanProfileNotFoundError } from '../errors/artisan-profile-not-found.error';
import { ArtisanProfilesRepository } from '@/domain/repositories/artisan-profiles.repository';
import { UsersRepository } from '@/domain/repositories/users.repository';
import { S3StorageService } from '@/domain/attachments/s3-storage.service';

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
  bio: string | null;
  avatar: string | null;
}

type Output = Either<
  ArtisanProfileNotFoundError | UserNotFoundError,
  GetArtisanProfileByUsernameOutput
>;

@Injectable()
export class GetArtisanProfileByUsernameUseCase {
  private readonly logger = new Logger(GetArtisanProfileByUsernameUseCase.name);

  constructor(
    private readonly artisanProfileRepository: ArtisanProfilesRepository,
    private readonly usersRepository: UsersRepository,
    private readonly s3StorageService: S3StorageService,
  ) {}

  async execute({ username }: GetArtisanProfileByUsernameInput): Promise<Output> {
    try {
      this.logger.debug(`Fetching artisan profile for username: ${username}`);

      const artisanProfile = await this
        .artisanProfileRepository
        .findByUserName(username);

      if (!artisanProfile) {
        this.logger.warn(`Artisan profile not found for username: ${username}`);
        return left(new ArtisanProfileNotFoundError(username));
      }

      this.logger.debug(`Found artisan profile for user ID: ${artisanProfile.userId}`);

      const user = await this.usersRepository.findById(artisanProfile.userId);

      if (!user) {
        this.logger.warn(`User not found for ID: ${artisanProfile.userId}`);
        return left(new UserNotFoundError(artisanProfile.userId, 'id'));
      }

      const avatar = await this.generateAvatarUrl(user.avatar);

      this.logger.debug(`Successfully retrieved profile for username: ${username}`);

      return right({
        userId: artisanProfile.userId,
        artisanName: user.name,
        userName: artisanProfile.artisanUserName,
        socialName: user.socialName ?? null,
        followersCount: artisanProfile.followersCount,
        productsCount: artisanProfile.productsCount,
        phoneNumber: user.phone,
        bio: artisanProfile.bio,
        avatar,
      });
    } catch (error) {
      this.logger.error(`Error getting artisan profile by username: ${username}`, error);
      return left(new ArtisanProfileNotFoundError(username));
    }
  }

  private async generateAvatarUrl(avatarId: string | null): Promise<string | null> {
    if (!avatarId) {
      return null;
    }

    try {
      const url = await this.s3StorageService.getUrlByFileName(avatarId);
      this.logger.debug(`Generated avatar URL for attachment: ${avatarId}`);
      return url;
    } catch (urlError) {
      this.logger.warn(`Failed to generate avatar URL for attachment ${avatarId}:`, urlError);
      return null;
    }
  }
}
