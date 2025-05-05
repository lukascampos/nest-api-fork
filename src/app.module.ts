import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './domain/identity/user/user.module';
import { envSchema } from './shared/env/env';
import { TestModule } from './domain/test/test.module';
import { AuthModule } from './domain/auth/auth.module';
<<<<<<< HEAD
import { AdminModule } from './domain/identity/admin/admin.module';
=======
import { ArtisanModule } from './domain/identity/artisan/artisan.module';
>>>>>>> 02056ddc10d5566d3993c49fe2417ba999ca94f0

@Module({
  imports: [ConfigModule.forRoot({
    validate: (env) => envSchema.parse(env),
    isGlobal: true,
  }),
<<<<<<< HEAD
  UserModule, AuthModule, TestModule, AdminModule,
=======
  UserModule, ArtisanModule, AuthModule, TestModule,
>>>>>>> 02056ddc10d5566d3993c49fe2417ba999ca94f0
  ],
  controllers: [AppController],
  providers: [
    AppService,
  ],
})
export class AppModule {}
