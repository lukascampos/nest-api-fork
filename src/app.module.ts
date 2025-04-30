import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './domain/identity/user/user.module';
import { envSchema } from './shared/env/env';
import { TestModule } from './domain/test/test.module';
import { AuthModule } from './domain/auth/auth.module';
import { AdminModule } from './domain/identity/admin/admin.module';

@Module({
  imports: [ConfigModule.forRoot({
    validate: (env) => envSchema.parse(env),
    isGlobal: true,
  }),
  UserModule, AuthModule, TestModule
  UserModule, AuthModule, TestModule, AdminModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
  ],
})
export class AppModule {}
