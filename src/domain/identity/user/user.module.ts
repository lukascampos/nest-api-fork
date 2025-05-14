import { Module } from '@nestjs/common';
import { UpdateUserProfileInfoModule } from './update-user-profile-info/update-user-profile-info.module';
import { ListUserModule } from './list-user/list-user.module';
import { DisableUserModule } from './disable-user/disable-user.module';
import { RegisterWithArtisanModule } from './register-with-artisan/register-with-artisan.module';

@Module({
  imports: [
    UpdateUserProfileInfoModule,
    DisableUserModule,
    ListUserModule,
    RegisterWithArtisanModule,
  ],
})
export class UserModule {}
