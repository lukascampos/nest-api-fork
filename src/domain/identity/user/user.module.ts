import { Module } from '@nestjs/common';
import { UpdateUserProfileInfoModule } from './update-user-profile-info/update-user-profile-info.module';

@Module({
  imports: [
    UpdateUserProfileInfoModule,
  ],
})
export class UserModule {}
