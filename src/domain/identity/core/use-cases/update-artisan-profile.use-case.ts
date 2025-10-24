import { Injectable, Logger } from '@nestjs/common';
import { Either, left, right } from '@/domain/_shared/utils/either';
import { UserNotFoundError } from '../errors/user-not-found.error';
import { ArtisanProfileNotFoundError } from '../errors/artisan-profile-not-found.error';
import { UserAlreadyExistsError } from '../errors/user-already-exists.error';
import { InvalidUserDataError } from '../errors/invalid-user-data.error';
import { InvalidAttachmentError } from '../errors/invalid-attachment.error';
import { UsersRepository } from '@/domain/repositories/users.repository';
import { ArtisanProfilesRepository } from '@/domain/repositories/artisan-profiles.repository';
import { AttachmentsRepository } from '@/domain/repositories/attachments.repository';
import { S3StorageService } from '@/domain/attachments/s3-storage.service';
import { PrismaService } from '@/shared/prisma/prisma.service';

export interface UpdateArtisanProfileInput {
  artisanId: string;
  newUserName?: string;
  newBio?: string;
  newSicab?: string;
  newSicabRegistrationDate?: Date;
  newSicabValidUntil?: Date;
}

export interface UpdateArtisanProfileOutput {
  artisanUserName: string;
  bio?: string | null;
  sicab: string;
  sicabRegistrationDate: Date;
  sicabValidUntil: Date;
  followersCount: number;
  productsCount: number;
}

type Output = Either<
  | UserNotFoundError
  | ArtisanProfileNotFoundError
  | UserAlreadyExistsError
  | InvalidUserDataError
  | InvalidAttachmentError,
  { artisan: UpdateArtisanProfileOutput }
>;

@Injectable()
export class UpdateArtisanProfileUseCase {
  private readonly logger = new Logger(UpdateArtisanProfileUseCase.name);

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly artisanProfilesRepository: ArtisanProfilesRepository,
    private readonly attachmentsRepository: AttachmentsRepository,
    private readonly s3AttachmentsStorage: S3StorageService,
    private readonly prisma: PrismaService,
  ) {}

  async execute(input: UpdateArtisanProfileInput): Promise<Output> {
    try {
      this.logger.debug(`Updating artisan profile for user: ${input.artisanId}`);

      const user = await this.usersRepository.findById(input.artisanId);
      if (!user) {
        this.logger.warn(`User not found: ${input.artisanId}`);
        return left(new UserNotFoundError(input.artisanId, 'id'));
      }

      const artisanProfile = await this.artisanProfilesRepository.findByUserId(input.artisanId);
      if (!artisanProfile) {
        this.logger.warn(`Artisan profile not found for user: ${input.artisanId}`);
        return left(new ArtisanProfileNotFoundError(input.artisanId));
      }

      const validationResult = await this.validateUniqueFields(input);
      if (validationResult) {
        return left(validationResult);
      }

      const updatedData = await this.updateArtisanInTransaction(input);

      this.logger.log(`Artisan profile updated successfully for user: ${input.artisanId}`);

      if (!updatedData.artisan) {
        this.logger.error(`Updated artisan data is null for user: ${input.artisanId}`);
        return left(new ArtisanProfileNotFoundError(input.artisanId));
      }

      return right({
        artisan: {
          artisanUserName: updatedData.artisan.artisanUserName,
          bio: updatedData.artisan.bio,
          sicab: updatedData.artisan.sicab,
          sicabRegistrationDate: updatedData.artisan.sicabRegistrationDate,
          sicabValidUntil: updatedData.artisan.sicabValidUntil,
          followersCount: updatedData.artisan.followersCount,
          productsCount: updatedData.artisan.productsCount,
        },
      });
    } catch (error) {
      this.logger.error(`Error updating artisan profile for user ${input.artisanId}:`, error);

      if (error.code === 'P2002') {
        const field = error.meta?.target?.[0] || 'campo';
        return left(new UserAlreadyExistsError('valor duplicado', field));
      }

      return left(new InvalidUserDataError('Erro interno do servidor'));
    }
  }

  private async validateUniqueFields(
    input: UpdateArtisanProfileInput,
  ): Promise<UserAlreadyExistsError | null> {
    if (input.newUserName) {
      const existingArtisanWithUserName = await this
        .artisanProfilesRepository
        .findByUserName(input.newUserName);
      if (existingArtisanWithUserName && existingArtisanWithUserName.userId !== input.artisanId) {
        this.logger.warn(`Artisan username already in use: ${input.newUserName}`);
        return new UserAlreadyExistsError(input.newUserName, 'artisanUserName');
      }
    }

    return null;
  }

  private async updateArtisanInTransaction(input: UpdateArtisanProfileInput) {
    return this.prisma.$transaction(async (tx) => {
      const artisanUpdateData: {
        artisanUserName?: string;
        rawMaterial?: string[];
        technique?: string[];
        finalityClassification?: string[];
        bio?: string;
        sicab?: string;
        sicabRegistrationDate?: Date;
        sicabValidUntil?: Date;
        updatedAt: Date;
      } = {
        updatedAt: new Date(),
      };

      if (input.newUserName) {
        artisanUpdateData.artisanUserName = input.newUserName;
        this.logger.debug(`Updating artisan username for user ${input.artisanId}`);
      }

      if (input.newBio !== undefined) {
        artisanUpdateData.bio = input.newBio;
        this.logger.debug(`Updating bio for user ${input.artisanId}`);
      }

      if (input.newSicab) {
        artisanUpdateData.sicab = input.newSicab;
        this.logger.debug(`Updating SICAB for user ${input.artisanId}`);
      }

      if (input.newSicabRegistrationDate) {
        artisanUpdateData.sicabRegistrationDate = input.newSicabRegistrationDate;
        this.logger.debug(`Updating SICAB registration date for user ${input.artisanId}`);
      }

      if (input.newSicabValidUntil) {
        artisanUpdateData.sicabValidUntil = input.newSicabValidUntil;
        this.logger.debug(`Updating SICAB valid until for user ${input.artisanId}`);
      }

      const updatedArtisan = Object.keys(artisanUpdateData).length > 1
        ? await tx.artisanProfile.update({
          where: { userId: input.artisanId },
          data: artisanUpdateData,
          select: {
            artisanUserName: true,
            rawMaterial: true,
            technique: true,
            finalityClassification: true,
            bio: true,
            sicab: true,
            sicabRegistrationDate: true,
            sicabValidUntil: true,
            followersCount: true,
            productsCount: true,
          },
        })
        : await tx.artisanProfile.findUnique({
          where: { userId: input.artisanId },
          select: {
            artisanUserName: true,
            rawMaterial: true,
            technique: true,
            finalityClassification: true,
            bio: true,
            sicab: true,
            sicabRegistrationDate: true,
            sicabValidUntil: true,
            followersCount: true,
            productsCount: true,
          },
        });

      return {
        artisan: updatedArtisan,
      };
    });
  }
}
