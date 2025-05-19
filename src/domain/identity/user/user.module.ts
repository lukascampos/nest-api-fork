import { Module } from '@nestjs/common';
import { UpdateUserProfileInfoModule } from './update-user-profile-info/update-user-profile-info.module';
import { ListUserModule } from './list-user/list-user.module';

@Module({
  imports: [
    UpdateUserProfileInfoModule,
    ListUserModule,
  ],
})
export class UserModule {}
