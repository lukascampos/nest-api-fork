import { Module } from '@nestjs/common';
import { CreateAccountController } from './controllers/create-account.controller';
import { CreateAccountUseCase } from '../core/use-cases/create-account.use-case';
import { IdentityPersistenceModule } from '../persistence/identity-persistence.module';
import { CryptographyModule } from '@/shared/cryptography/cryptography.module';
import { AuthenticateController } from './controllers/authenticate.controller';
import { AuthenticateUseCase } from '../core/use-cases/authenticate.use-case';

@Module({
  imports: [IdentityPersistenceModule, CryptographyModule],
  controllers: [
    AuthenticateController,
    CreateAccountController,
  ],
  providers: [
    AuthenticateUseCase,
    CreateAccountUseCase,
  ],
})
export class HttpModule {}
