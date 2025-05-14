import { Module } from '@nestjs/common';
import { CreateAccountController } from './controllers/create-account.controller';
import { CreateAccountUseCase } from '../core/use-cases/create-account.use-case';
import { IdentityPersistenceModule } from '../persistence/identity-persistence.module';
import { CryptographyModule } from '@/shared/cryptography/cryptography.module';

@Module({
  imports: [IdentityPersistenceModule, CryptographyModule],
  controllers: [
    CreateAccountController,
  ],
  providers: [
    CreateAccountUseCase,
  ],
})
export class HttpModule {}
