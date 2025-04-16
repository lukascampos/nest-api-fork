import { Module } from '@nestjs/common';
import { CreateUserModule } from './create-user/create-user.module';
import { ListUser } from './list-user/list-user.module';

@Module({
  imports: [CreateUserModule, ListUser],
})
export class UserModule {}
