import { Injectable } from '@nestjs/common';
import { ArtisanApplicationsRepository } from '../repositories/artisan-applications.repository';
import { ArtisanApplication, ArtisanApplicationStatus } from '../entities/artisan-application.entity';
import { Either, left, right } from '@/domain/_shared/utils/either';
import { UsersRepository } from '../repositories/users.repository';
import { NoArtisanApplicationsFoundError } from '../errors/no-artisan-applications-found.error';

export interface GetAllArtisanApplicationsWithUserNamesOutput {
  id: string;
  artisanName: string;
  rawMaterial: string;
  technique: string;
  sicab: string;
  status: ArtisanApplicationStatus
}

type Output = Either <
  NoArtisanApplicationsFoundError,
  { artisanApplications: GetAllArtisanApplicationsWithUserNamesOutput[] }
>

@Injectable()
export class GetAllArtisanApplicationsWithUserNamesUseCase {
  constructor(
    private readonly artisanApplicationsRepository: ArtisanApplicationsRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(): Promise<Output> {
    const artisanApplications = await this.artisanApplicationsRepository.listAll();

    if (artisanApplications.length === 0) {
      return left(new NoArtisanApplicationsFoundError());
    }

    const users = await this
      .usersRepository
      .findManyByIds(artisanApplications.map((ap: ArtisanApplication) => ap.userId));

    const applicationsWithUserName = artisanApplications.map((ap: ArtisanApplication) => {
      const user = users.find((u) => u.id === ap.userId);

      return {
        id: ap.id,
        artisanName: user?.name,
        rawMaterial: ap.rawMaterial,
        technique: ap.technique,
        sicab: ap.sicab,
        status: ap.status,
      } as GetAllArtisanApplicationsWithUserNamesOutput;
    });

    return right({ artisanApplications: applicationsWithUserName });
  }
}
