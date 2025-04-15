import { Module } from '@nestjs/common';
import { CreateUserModule } from './create-user/create-user.module';
import { AuthenticateModule } from './authenticate/authenticate.module';

@Module({
  imports: [CreateUserModule, AuthenticateModule],
})
export class UserModule {}
