import { Module } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { PrismaUsersRepository } from './prisma/repositories/prisma-users.repository';
import { PrismaArtisanApplicationsRepository } from './prisma/repositories/prisma-artisan-applications.repository';

@Module({
  providers: [
    PrismaService,
    PrismaArtisanApplicationsRepository,
    PrismaUsersRepository,
  ],
  exports: [
    PrismaArtisanApplicationsRepository,
    PrismaUsersRepository,
  ],
})
export class IdentityPersistenceModule {}
