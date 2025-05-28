import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@/domain/_shared/utils/either';
import { ArtisanApplicationStatus } from '../entities/artisan-application.entity';
import { ArtisanApplicationsRepository } from '../repositories/artisan-applications.repository';
import { UsersRepository } from '../repositories/users.repository';
import { ArtisanApplicationNotFoundError } from '../errors/artisan-application-not-found.error';
import { UserNotFoundError } from '../errors/user-not-found.error';

export interface GetArtisanApplicationDetailsInput {
  artisanApplicationId: string;
}

export interface GetArtisanApplicationDetailsOutput {
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  rawMaterial: string;
  technique: string;
  finalityClassification: string;
  sicab: string;
  sicabRegistrationDate: Date;
  sicabValidUntil: Date;
  status: ArtisanApplicationStatus;
}

type Output = Either<
  ArtisanApplicationNotFoundError | UserNotFoundError,
  { artisanApplication: GetArtisanApplicationDetailsOutput }
>;

@Injectable()
export class GetArtisanApplicationDetailsUseCase {
  constructor(
    private readonly artisanApplicationsRepository: ArtisanApplicationsRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute({ artisanApplicationId }: GetArtisanApplicationDetailsInput): Promise<Output> {
    const artisanApplication = await this
      .artisanApplicationsRepository
      .findById(artisanApplicationId);

    if (!artisanApplication) {
      return left(new ArtisanApplicationNotFoundError(artisanApplicationId));
    }

    const user = await this.usersRepository.findById(artisanApplication.userId);

    if (!user) {
      return left(new ArtisanApplicationNotFoundError(artisanApplicationId));
    }

    return right({
      artisanApplication: {
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        userPhone: user.phone,
        rawMaterial: artisanApplication.rawMaterial,
        technique: artisanApplication.technique,
        finalityClassification: artisanApplication.finalityClassification,
        sicab: artisanApplication.sicab,
        sicabRegistrationDate: artisanApplication.sicabRegistrationDate,
        sicabValidUntil: artisanApplication.sicabValidUntil,
        status: artisanApplication.status,
      },
    });
  }
}
