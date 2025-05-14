import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './domain/identity/user/user.module';
import { envSchema } from './shared/env/env';
import { TestModule } from './domain/test/test.module';
import { AuthModule } from './domain/_shared/auth/auth.module';
import { AdminModule } from './domain/identity/admin/admin.module';
import { ArtisanModule } from './domain/identity/artisan/artisan.module';
import { HttpModule } from './domain/identity/http/http.module';

@Module({
  imports: [ConfigModule.forRoot({
    validate: (env) => envSchema.parse(env),
    isGlobal: true,
  }),
  HttpModule,
  UserModule, ArtisanModule, AuthModule, TestModule, AdminModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
  ],
})
export class AppModule {}
