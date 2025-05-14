import { Module } from '@nestjs/common';
import { UsersRepository } from '../core/repositories/users.repository';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { PrismaUsersRepository } from './prisma/repositories/prisma-users.repository';

@Module({
  providers: [
    PrismaService,
    {
      provide: UsersRepository,
      useClass: PrismaUsersRepository,
    },
  ],
  exports: [
    UsersRepository,
  ],
})
export class IdentityPersistenceModule {}
