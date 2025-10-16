import { Module } from '@nestjs/common';
import { AuthenticateUseCase } from '../core/use-cases/authenticate.use-case';
import { GetArtisanApplicationDetailsUseCase } from '../core/use-cases/get-artisan-application-details.use-case';
import { ModerateArtisanApplicationUseCase } from '../core/use-cases/moderate-artisan-application.use-case';
import { SearchUsersUseCase } from '../core/use-cases/search-users.use-case';
import { InitiateArtisanApplicationUseCase } from '../core/use-cases/initiate-artisan-application.use-case';
import { GetAllArtisanApplicationsUseCase } from '../core/use-cases/get-all-artisan-applications.use-case';
import { CreateUserUseCase } from '../core/use-cases/create-user.use-case';
import { CompleteArtisanApplicationUseCase } from '../core/use-cases/complete-artisan-application.use-case';
import { RepositoriesModule } from '@/domain/repositories/repositories.module';
import { AttachmentsModule } from '@/domain/attachments/attachments.module';
import { AuthenticateController } from './controllers/authenticate.controller';
import { CompleteArtisanApplicationController } from './controllers/complete-artisan-application.controller';
import { CreateUserController } from './controllers/create-user.controller';
import { GetAllArtisanApplicationsController } from './controllers/get-all-artisan-applications.controller';
import { GetArtisanApplicationDetailsController } from './controllers/get-artisan-application-details.controller';
import { InitiateArtisanApplicationController } from './controllers/initiate-artisan-application.controller';
import { ModerateArtisanApplicationController } from './controllers/moderate-artisan-application.controller';
import { SearchUsersController } from './controllers/search-users.controller';
import { GetArtisanProfileByUsernameController } from './controllers/get-artisan-profile-by-username.controller';
import { GetArtisanProfileByUsernameUseCase } from '../core/use-cases/get-artisan-profile-by-username.use-case';
import { UpdatePersonalProfileDataController } from './controllers/update-personal-profile-data.controller';
import { UpdatePersonalProfileDataUseCase } from '../core/use-cases/update-personal-profile-data.use-case';
import { UpdateArtisanProfileUseCase } from '../core/use-cases/update-artisan-profile.use-case';
import { GetMyProfileController } from './controllers/get-my-profile.controller';
import { GetMyProfileUseCase } from '../core/use-cases/get-my-profile.use-case';

@Module({
  imports: [RepositoriesModule, AttachmentsModule],
  controllers: [
    AuthenticateController,
    CompleteArtisanApplicationController,
    CreateUserController,
    GetAllArtisanApplicationsController,
    GetArtisanApplicationDetailsController,
    GetArtisanProfileByUsernameController,
    GetMyProfileController,
    InitiateArtisanApplicationController,
    ModerateArtisanApplicationController,
    SearchUsersController,
    UpdatePersonalProfileDataController,
  ],
  providers: [
    AuthenticateUseCase,
    CompleteArtisanApplicationUseCase,
    CreateUserUseCase,
    GetAllArtisanApplicationsUseCase,
    GetArtisanProfileByUsernameUseCase,
    GetArtisanApplicationDetailsUseCase,
    GetMyProfileUseCase,
    InitiateArtisanApplicationUseCase,
    ModerateArtisanApplicationUseCase,
    SearchUsersUseCase,
    AuthenticateUseCase,
    GetArtisanApplicationDetailsUseCase,
    ModerateArtisanApplicationUseCase,
    UpdateArtisanProfileUseCase,
    UpdatePersonalProfileDataUseCase,
  ],
})
export class HttpModule {}
