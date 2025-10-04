import { Injectable, Logger } from '@nestjs/common';
import { Roles, RequestStatus, ArtisanApplication } from '@prisma/client';
import slugify from 'slugify';
import { Either, left, right } from '@/domain/_shared/utils/either';
import { ArtisanApplicationsRepository } from '@/domain/repositories/artisan-applications.repository';
import { ArtisanProfilesRepository } from '@/domain/repositories/artisan-profiles.repository';
import { UsersRepository } from '@/domain/repositories/users.repository';
import { ApplicationAlreadyModeratedError } from '../errors/application-already-moderated.error';
import { ApplicationNotFoundError } from '../errors/application-not-found.error';
import { MissingPropertyError } from '../errors/missing-property.error';
import { UserNotFoundError } from '../errors/user-not-found.error';

export interface ModerateArtisanApplicationInput {
  applicationId: string;
  status: 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  reviewerId: string;
}

type Output = Either<
  ApplicationNotFoundError |
  ApplicationAlreadyModeratedError |
  MissingPropertyError |
  UserNotFoundError,
  void
>;

@Injectable()
export class ModerateArtisanApplicationUseCase {
  private readonly logger = new Logger(ModerateArtisanApplicationUseCase.name);

  constructor(
    private readonly artisanApplicationsRepository: ArtisanApplicationsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly artisanProfilesRepository: ArtisanProfilesRepository,
  ) {}

  async execute({
    applicationId,
    status,
    rejectionReason,
    reviewerId,
  }: ModerateArtisanApplicationInput): Promise<Output> {
    try {
      this.logger.debug(`Moderating application ${applicationId} with status ${status}`);

      const application = await this.artisanApplicationsRepository.findById(applicationId);

      if (!application) {
        this.logger.warn(`Application not found: ${applicationId}`);
        return left(new ApplicationNotFoundError());
      }

      if (application.status !== RequestStatus.PENDING) {
        this.logger.warn(`Application ${applicationId} already moderated`);
        return left(new ApplicationAlreadyModeratedError());
      }

      if (status === 'APPROVED') {
        await this.approveApplication(application, reviewerId);
      } else {
        if (!rejectionReason) {
          return left(new MissingPropertyError('rejectionReason'));
        }
        await this.rejectApplication(application, rejectionReason, reviewerId);
      }

      this.logger.log(`Application ${applicationId} ${status.toLowerCase()} successfully`);
      return right(undefined);
    } catch (error) {
      this.logger.error(`Error moderating application ${applicationId}:`, error);
      return left(new Error('Erro interno do servidor'));
    }
  }

  private async approveApplication(
    application: ArtisanApplication,
    reviewerId: string,
  ): Promise<void> {
    const user = await this.usersRepository.findById(application.userId);

    if (!user) {
      throw new UserNotFoundError(application.userId, 'id');
    }

    const artisanProfile = await this.artisanProfilesRepository.findByUserId(application.userId);

    if (artisanProfile) {
      await this.artisanProfilesRepository.update(artisanProfile.id, {
        rawMaterial: application.rawMaterial,
        technique: application.technique,
        finalityClassification: application.finalityClassification,
        sicab: application.sicab!,
        sicabRegistrationDate: application.sicabRegistrationDate!,
        sicabValidUntil: application.sicabValidUntil!,
        isDisabled: false,
      });
    } else {
      const userName = await this.generateUniqueUserName(user.name);

      await this.artisanProfilesRepository.create({
        userId: application.userId,
        artisanUserName: userName,
        rawMaterial: application.rawMaterial,
        technique: application.technique,
        finalityClassification: application.finalityClassification,
        sicab: application.sicab!,
        sicabRegistrationDate: application.sicabRegistrationDate!,
        sicabValidUntil: application.sicabValidUntil!,
        bio: application.bio ?? undefined,
        followersCount: 0,
        productsCount: 0,
        isDisabled: false,
      });
    }

    await this.artisanApplicationsRepository.moderateApplication(application.id, {
      status: RequestStatus.APPROVED,
      reviewerId,
    });

    if (!user.roles.includes(Roles.ARTISAN)) {
      const updatedRoles = [...user.roles, Roles.ARTISAN];
      await this.usersRepository.updateRoles(user.id, updatedRoles);
    }
  }

  private async rejectApplication(
    application: ArtisanApplication,
    rejectionReason: string,
    reviewerId: string,
  ): Promise<void> {
    await this.artisanApplicationsRepository.moderateApplication(application.id, {
      status: RequestStatus.REJECTED,
      rejectionReason,
      reviewerId,
    });
  }

  private async generateUniqueUserName(baseName: string): Promise<string> {
    const slugBase = slugify(baseName, { lower: true });
    let candidate = slugBase;
    let counter = 1;

    let existingProfile = await this.artisanProfilesRepository.findByUserName(candidate);

    while (existingProfile) {
      candidate = `${slugBase}-${counter}`;
      counter += 1;
      // eslint-disable-next-line no-await-in-loop
      existingProfile = await this.artisanProfilesRepository.findByUserName(candidate);
    }

    return candidate;
  }
}
