import { Injectable, Logger } from '@nestjs/common';
import { Roles } from '@prisma/client';
import { Either, left, right } from '@/domain/_shared/utils/either';
import { ArtisanApplicationsRepository } from '@/domain/repositories/artisan-applications.repository';
import { UsersRepository } from '@/domain/repositories/users.repository';
import { PendingApplicationAlreadyExistsError } from '../errors/pending-application-already-exists.error';
import { UserAlreadyArtisanError } from '../errors/user-already-artisan.error';
import { UserNotFoundError } from '../errors/user-not-found.error';

export interface InitiateArtisanApplicationInput {
  userId: string;
  wantsToCompleteNow: boolean;
}

export interface InitiateArtisanApplicationOutput {
  applicationId: string;
  shouldShowForm: boolean;
  message: string;
}

type Output = Either<
  UserNotFoundError | PendingApplicationAlreadyExistsError | UserAlreadyArtisanError,
  InitiateArtisanApplicationOutput
>;

@Injectable()
export class InitiateArtisanApplicationUseCase {
  private readonly logger = new Logger(InitiateArtisanApplicationUseCase.name);

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly artisanApplicationsRepository: ArtisanApplicationsRepository,
  ) {}

  async execute(input: InitiateArtisanApplicationInput): Promise<Output> {
    const { userId, wantsToCompleteNow } = input;

    try {
      const user = await this.usersRepository.findById(userId);

      if (!user) {
        return left(new UserNotFoundError(userId, 'id'));
      }

      if (user.roles.includes(Roles.ARTISAN)) {
        return left(new UserAlreadyArtisanError());
      }

      const existingApplication = await this
        .artisanApplicationsRepository
        .findPendingByUserId(userId);

      if (existingApplication) {
        return left(new PendingApplicationAlreadyExistsError());
      }

      const application = await this.artisanApplicationsRepository.create({
        userId,
        formStatus: wantsToCompleteNow ? 'NOT_STARTED' : 'POSTPONED',
        type: 'BE_ARTISAN',
        rawMaterial: [],
        technique: [],
        finalityClassification: [],
      });

      this.logger.log(`Artisan application initiated: ${application.id} - User: ${userId}`);

      return right({
        applicationId: application.id,
        shouldShowForm: wantsToCompleteNow,
        message: wantsToCompleteNow
          ? 'Preencha o formulário para completar sua solicitação'
          : 'Sua solicitação foi salva. Você pode completá-la a qualquer momento',
      });
    } catch (error) {
      this.logger.error('Error initiating artisan application:', error);
      throw error;
    }
  }
}
