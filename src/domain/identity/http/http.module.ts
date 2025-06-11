import { Module } from '@nestjs/common';
import { PrismaArtisanApplicationsRepository } from '../persistence/prisma/repositories/prisma-artisan-applications.repository';
import { IdentityPersistenceModule } from '../persistence/identity-persistence.module';
import { CreateAccountController } from './controllers/create-account.controller';
import { AuthenticateController } from './controllers/authenticate.controller';
import { AddModeratorRoleController } from './controllers/add-moderator-role.controller';
import { DeactivateUserController } from './controllers/deactivate-user.controller';
import { GetAllUsersController } from './controllers/get-all-users.controller';
import { UpdatePersonalProfileDataController } from './controllers/update-personal-profile-data.controller';
import { CreateArtisanApplicationController } from './controllers/create-artisan-application.controller';
import { GetAllArtisanApplicationsWithUserNamesController } from './controllers/get-all-artisan-applications-with-user-names.controller';
import { GetArtisanApplicationDetailsController } from './controllers/get-artisan-application-details.controller';
import { DisableArtisanController } from './controllers/disable-artisan.controller';
import { CreateAccountUseCase } from '../core/use-cases/create-account.use-case';
import { AuthenticateUseCase } from '../core/use-cases/authenticate.use-case';
import { AddModeratorRoleUseCase } from '../core/use-cases/add-moderator-role.use-case';
import { DeactivateUserUseCase } from '../core/use-cases/deactivate-user.use-case';
import { GetAllUsersUseCase } from '../core/use-cases/get-all-users.use-case';
import { UpdatePersonalProfileDataUseCase } from '../core/use-cases/update-personal-profile-data.use-case';
import { CreateArtisanApplicationUseCase } from '../core/use-cases/create-artisan-application.use-case';
import { GetAllArtisanApplicationsWithUserNamesUseCase } from '../core/use-cases/get-all-artisan-applications-with-user-names.use-case';
import { GetArtisanApplicationDetailsUseCase } from '../core/use-cases/get-artisan-application-details.use-case';
import { ModerateArtisanApplicationController } from './controllers/moderate-artisan-application.controller';
import { ModerateArtisanApplicationUseCase } from '../core/use-cases/moderate-artisan-application.use-case';

@Module({
  imports: [IdentityPersistenceModule],
  controllers: [
    AddModeratorRoleController,
    AuthenticateController,
    CreateAccountController,
    DeactivateUserController,
    GetAllUsersController,
    UpdatePersonalProfileDataController,
    CreateArtisanApplicationController,
    GetAllArtisanApplicationsWithUserNamesController,
    GetArtisanApplicationDetailsController,
    ModerateArtisanApplicationController,
  ],
  providers: [
    AddModeratorRoleUseCase,
    AuthenticateUseCase,
    CreateAccountUseCase,
    DeactivateUserUseCase,
    GetAllUsersUseCase,
    UpdatePersonalProfileDataUseCase,
    CreateArtisanApplicationUseCase,
    GetAllArtisanApplicationsWithUserNamesUseCase,
    GetArtisanApplicationDetailsUseCase,
    ModerateArtisanApplicationUseCase,
  ],
})
export class HttpModule {}
