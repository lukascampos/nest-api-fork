import { Injectable, Logger } from '@nestjs/common';
import { Either, left, right } from '@/domain/_shared/utils/either';
import { UserNotFoundError } from '../errors/user-not-found.error';
import { UsersRepository } from '@/domain/repositories/users.repository';
import { ArtisanProfilesRepository } from '@/domain/repositories/artisan-profiles.repository';
import { S3StorageService } from '@/domain/attachments/s3-storage.service';

export interface GetMyProfileInput {
  userId: string;
  userRoles: string[];
}

export interface GetMyProfileOutput {
  id: string;
  name: string;
  socialName?: string | null;
  phone: string;
  email: string;
  avatar?: string | null;
  artisan?: {
    comercialName: string;
    zipCode: string;
    address: string;
    addressNumber: string;
    addressComplement?: string;
    neighborhood: string;
    city: string;
    state: string;
    artisanUserName: string;
    bio: string | null;
    sicab: string;
    sicabRegistrationDate: Date | null;
    sicabValidUntil: Date | null;
    followersCount: number;
    productsCount: number;
    rawMaterial: string[];
    technique: string[];
    finalityClassification: string[];
  }
}

type Output = Either<UserNotFoundError, { user: GetMyProfileOutput }>;

@Injectable()
export class GetMyProfileUseCase {
  private readonly logger = new Logger(GetMyProfileUseCase.name);

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly artisanProfilesRepository: ArtisanProfilesRepository,
    private readonly s3AttachmentsStorage: S3StorageService,
  ) {}

  async execute({ userId, userRoles }: GetMyProfileInput): Promise<Output> {
    try {
      this.logger.debug(`Getting profile for user: ${userId}`);

      const user = await this.usersRepository.findById(userId);

      if (!user) {
        this.logger.warn(`User not found: ${userId}`);
        return left(new UserNotFoundError(userId, 'id'));
      }

      const avatar = await this.generateAvatarUrl(user.avatar);

      const profileData: GetMyProfileOutput = {
        id: user.id,
        name: user.name,
        socialName: user.socialName,
        phone: user.phone,
        email: user.email,
        avatar,
      };

      let artisanProfileData: GetMyProfileOutput['artisan'] | undefined;

      if (userRoles.includes('ARTISAN')) {
        this.logger.debug(`User is ARTISAN, fetching artisan profile for user: ${userId}`);

        const artisanProfile = await this.artisanProfilesRepository.findByUserId(userId);

        if (artisanProfile) {
          this.logger.debug(`Found artisan profile for user: ${userId}`);

          artisanProfileData = {
            comercialName: artisanProfile.comercialName,
            zipCode: artisanProfile.ArtisanProfileAddress!.zipCode,
            address: artisanProfile.ArtisanProfileAddress!.address,
            addressNumber: artisanProfile.ArtisanProfileAddress!.addressNumber,
            neighborhood: artisanProfile.ArtisanProfileAddress!.neighborhood,
            city: artisanProfile.ArtisanProfileAddress!.city,
            state: artisanProfile.ArtisanProfileAddress!.state,
            artisanUserName: artisanProfile.artisanUserName,
            bio: artisanProfile.bio,
            sicab: artisanProfile.sicab,
            sicabRegistrationDate: artisanProfile.sicabRegistrationDate,
            sicabValidUntil: artisanProfile.sicabValidUntil,
            followersCount: artisanProfile.followersCount,
            productsCount: artisanProfile.productsCount,
            rawMaterial: artisanProfile.rawMaterial,
            technique: artisanProfile.technique,
            finalityClassification: artisanProfile.finalityClassification,
          };

          Object.assign(artisanProfileData, {
            comercialName: artisanProfile.comercialName,
            zipCode: artisanProfile.ArtisanProfileAddress?.zipCode,
            address: artisanProfile.ArtisanProfileAddress?.address,
            addressNumber: artisanProfile.ArtisanProfileAddress?.addressNumber,
            addressComplement: artisanProfile.ArtisanProfileAddress?.addressComplement,
            neighborhood: artisanProfile.ArtisanProfileAddress?.neighborhood,
            city: artisanProfile.ArtisanProfileAddress?.city,
            state: artisanProfile.ArtisanProfileAddress?.state,
            artisanUserName: artisanProfile.artisanUserName,
            bio: artisanProfile.bio,
            sicab: artisanProfile.sicab ?? '',
            sicabRegistrationDate: artisanProfile.sicabRegistrationDate ?? null,
            sicabValidUntil: artisanProfile.sicabValidUntil ?? null,
            followersCount: artisanProfile.followersCount ?? 0,
            productsCount: artisanProfile.productsCount ?? 0,
            rawMaterial: artisanProfile.rawMaterial,
            technique: artisanProfile.technique,
            finalityClassification: artisanProfile.finalityClassification,
          });
        } else {
          this.logger.warn(`Artisan profile not found for user: ${userId}`);
        }
      }

      this.logger.debug(`Successfully retrieved profile for user: ${userId}`);

      return right({
        user: {
          ...profileData,
          artisan: artisanProfileData,
        },
      });
    } catch (error) {
      this.logger.error(`Error getting profile for user ${userId}:`, error);
      return left(new UserNotFoundError(userId, 'id'));
    }
  }

  private async generateAvatarUrl(avatarId: string | null): Promise<string | null> {
    if (!avatarId) {
      return null;
    }

    try {
      const url = await this.s3AttachmentsStorage.getUrlByFileName(avatarId);
      this.logger.debug(`Generated avatar URL for attachment: ${avatarId}`);
      return url;
    } catch (urlError) {
      this.logger.warn(`Failed to generate avatar URL for attachment ${avatarId}:`, urlError);
      return null;
    }
  }
}
