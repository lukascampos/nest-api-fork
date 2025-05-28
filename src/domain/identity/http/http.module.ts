import { Module } from '@nestjs/common';
import { CreateAccountController } from './controllers/create-account.controller';
import { CreateAccountUseCase } from '../core/use-cases/create-account.use-case';
import { IdentityPersistenceModule } from '../persistence/identity-persistence.module';
import { CryptographyModule } from '@/shared/cryptography/cryptography.module';
import { AuthenticateController } from './controllers/authenticate.controller';
import { AuthenticateUseCase } from '../core/use-cases/authenticate.use-case';
import { AddModeratorRoleController } from './controllers/add-moderator-role.controller';
import { AddModeratorRoleUseCase } from '../core/use-cases/add-moderator-role.use-case';
import { DeactivateUserController } from './controllers/deactivate-user.controller';
import { DeactivateUserUseCase } from '../core/use-cases/deactivate-user.use-case';
import { GetAllUsersUseCase } from '../core/use-cases/get-all-users.use-case';
import { GetAllUsersController } from './controllers/get-all-users.controller';
import { UpdatePersonalProfileDataUseCase } from '../core/use-cases/update-personal-profile-data.use-case';
import { UpdatePersonalProfileDataController } from './controllers/update-personal-profile-data.controller';
import { CreateArtisanApplicationController } from './controllers/create-artisan-application.controller';
import { CreateArtisanApplicationUseCase } from '../core/use-cases/create-artisan-application.use-case';
import { GetAllArtisanApplicationsWithUserNamesController } from './controllers/get-all-artisan-applications-with-user-names.controller';
import { GetAllArtisanApplicationsWithUserNamesUseCase } from '../core/use-cases/get-all-artisan-applications-with-user-names.use-case';
import { GetArtisanApplicationDetailsController } from './controllers/get-artisan-application-details.controller';
import { GetArtisanApplicationDetailsUseCase } from '../core/use-cases/get-artisan-application-details.use-case';

@Module({
  imports: [IdentityPersistenceModule, CryptographyModule],
  controllers: [
    AddModeratorRoleController,
    AuthenticateController,
    CreateAccountController,
    DeactivateUserController,
    GetAllUsersController,
    UpdatePersonalProfileDataController,

    // ArtisanModule,
    CreateArtisanApplicationController,
    GetAllArtisanApplicationsWithUserNamesController,
    GetArtisanApplicationDetailsController,
  ],
  providers: [
    AddModeratorRoleUseCase,
    AuthenticateUseCase,
    CreateAccountUseCase,
    DeactivateUserUseCase,
    GetAllUsersUseCase,
    UpdatePersonalProfileDataUseCase,

    // ArtisanModule,
    CreateArtisanApplicationUseCase,
    GetAllArtisanApplicationsWithUserNamesUseCase,
    GetArtisanApplicationDetailsUseCase,
  ],
})
export class HttpModule {}
