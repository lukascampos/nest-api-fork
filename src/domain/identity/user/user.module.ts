import { Module } from '@nestjs/common';
import { CreateUserModule } from './create-user/create-user.module';
import { ListUserModule } from './list-user/list-user.module';

@Module({
  imports: [CreateUserModule, ListUserModule],
})
export class UserModule {}
