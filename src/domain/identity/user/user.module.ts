import { Module } from '@nestjs/common';
import { CreateUserModule } from './create-user/create-user.module';
import { UpdateUserProfileInfoModule } from './update-user-profile-info/update-user-profile-info.module';
import { DisableUserModule } from './disable-user/disable-user.module';

@Module({
  imports: [CreateUserModule, UpdateUserProfileInfoModule, DisableUserModule],
})
export class UserModule {}
