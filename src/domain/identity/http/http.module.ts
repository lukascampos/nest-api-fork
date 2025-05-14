import { Module } from '@nestjs/common';
import { CreateAccountController } from './controllers/create-account.controller';
import { CreateAccountUseCase } from '../core/use-cases/create-account.use-case';
import { IdentityPersistenceModule } from '../persistence/identity-persistence.module';
import { CryptographyModule } from '@/shared/cryptography/cryptography.module';
import { AuthenticateController } from './controllers/authenticate.controller';
import { AuthenticateUseCase } from '../core/use-cases/authenticate.use-case';
import { AddModeratorRoleController } from './controllers/update-user-to-moderator.controller';
import { AddModeratorRoleUseCase } from '../core/use-cases/add-moderator-role.use-case';

@Module({
  imports: [IdentityPersistenceModule, CryptographyModule],
  controllers: [
    AddModeratorRoleController,
    AuthenticateController,
    CreateAccountController,
  ],
  providers: [
    AddModeratorRoleUseCase,
    AuthenticateUseCase,
    CreateAccountUseCase,
  ],
})
export class HttpModule {}
