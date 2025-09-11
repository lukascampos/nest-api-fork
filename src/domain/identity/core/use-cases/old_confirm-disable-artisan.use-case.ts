// import { Injectable } from '@nestjs/common';
// import { Either, left, right } from '@/domain/_shared/utils/either';
// import { ArtisanApplicationNotApprovedError } from '../errors/artisan-application-not-approved.error';
// import { PrismaArtisanApplicationsRepository } from '../../persistence/prisma/repositories/prisma-artisan-applications.repository';
// import { PrismaArtisanProfilesRepository } from '../../persistence/prisma/repositories/prisma-artisan-profiles.repository';
// import { ApplicationNotFoundError } from '../errors/application-not-found.error';

// type Output = Either<
//   ApplicationNotFoundError | ArtisanApplicationNotApprovedError,
//   void
// >

// @Injectable()
// export class ConfirmDisableArtisanUseCase {
//   constructor(
//     private readonly appsRepo: PrismaArtisanApplicationsRepository,
//     private readonly profilesRepo: PrismaArtisanProfilesRepository,
//   ) {}

//   async execute(applicationId: string): Promise<Output> {
//     const app = await this.appsRepo.findById(applicationId);
//     if (!app) return left(new ApplicationNotFoundError());

//     if (app.status !== 'APPROVED') {
//       return left(new ArtisanApplicationNotApprovedError());
//     }

//     await this.profilesRepo.disableByUserId(app.userId);
//     return right(undefined);
//   }
// }
