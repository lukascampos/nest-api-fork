import { Module } from '@nestjs/common';
import { CreateUserModule } from './create-user/create-user.module';
import { UpdateUserProfileInfoModule } from './update-user-profile-info/update-user-profile-info.module';

@Module({
  imports: [CreateUserModule, UpdateUserProfileInfoModule],
})
export class UserModule {}
