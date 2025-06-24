import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@/domain/_shared/utils/either';
import { ArtisanApplication, ArtisanApplicationStatus } from '../entities/artisan-application.entity';
import { PendingDisableRequestAlreadyExistsError } from '../errors/pending-disable-request-already-exists.error';
import { ArtisanProfileNotFoundError } from '../errors/artisan-profile-not-found.error';
import { PrismaArtisanApplicationsRepository } from '../../persistence/prisma/repositories/prisma-artisan-applications.repository';
import { PrismaArtisanProfilesRepository } from '../../persistence/prisma/repositories/prisma-artisan-profiles.repository';

type Input = { userId: string };
type Output = Either<Error, ArtisanApplication>;

@Injectable()
export class RequestDisableArtisanUseCase {
  constructor(
    private readonly applicationsRepo: PrismaArtisanApplicationsRepository,
    private readonly profilesRepo: PrismaArtisanProfilesRepository,
  ) {}

  async execute(input: Input): Promise<Output> {
    const { userId } = input;
    const existing = await this.applicationsRepo.findByUserId(userId);
    if (existing?.some((a) => a.status === ArtisanApplicationStatus.PENDING)) {
      return left(new PendingDisableRequestAlreadyExistsError(userId));
    }
    const profile = await this.profilesRepo.findByUserId(userId);
    if (!profile) {
      return left(new ArtisanProfileNotFoundError(userId));
    }
    const application = ArtisanApplication.create({
      userId,
      rawMaterial: profile.rawMaterial,
      technique: profile.technique,
      finalityClassification: profile.finalityClassification,
      sicab: profile.sicab,
      sicabRegistrationDate: profile.sicabRegistrationDate,
      sicabValidUntil: profile.sicabValidUntil,
      status: ArtisanApplicationStatus.PENDING,
    });
    await this.applicationsRepo.save(application);
    return right(application);
  }
}
