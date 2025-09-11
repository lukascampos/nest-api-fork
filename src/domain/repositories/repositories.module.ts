import { Module } from '@nestjs/common';
import { AttachmentsRepository } from './attachments.repository';
import { ArtisanApplicationsRepository } from './artisan-applications.repository';
import { ArtisanProfilesRepository } from './artisan-profiles.repository';
import { UsersRepository } from './users.repository';
import { PrismaService } from '@/shared/prisma/prisma.service';

@Module({
  providers: [
    PrismaService,
    UsersRepository,
    AttachmentsRepository,
    ArtisanApplicationsRepository,
    ArtisanProfilesRepository,
  ],
  exports: [PrismaService,
    UsersRepository,
    AttachmentsRepository,
    ArtisanApplicationsRepository,
    ArtisanProfilesRepository,
  ],
})
export class RepositoriesModule {}
