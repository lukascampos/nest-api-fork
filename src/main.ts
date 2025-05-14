import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { Env } from './shared/env/env';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const configService = app.get<ConfigService<Env, true>>(ConfigService);
  app.useGlobalPipes(new ValidationPipe());
  const port = configService.get('PORT', { infer: true });

  console.log(`Server running on port ${port}`);

  await app.listen(port);
}
bootstrap();
