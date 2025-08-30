import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { Env } from './shared/env/env';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'https://potential-space-spork-9pq57q554q43pxw6-3000.app.github.dev',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: ['content-type', 'authorization', 'cookie'],
    credentials: true,
  });

  // Segundo: configurar cookie parser antes do logger
  app.use(cookieParser());
  // { changed code }
  app.use((req, res, next) => {
    const start = Date.now();

    // Log detalhado da requisição
    console.log('=== REQUISIÇÃO ===');
    console.log(`Método: ${req.method}`);
    console.log(`URL: ${req.originalUrl}`);
    console.log(`IP: ${req.ip || req.connection.remoteAddress}`);
    console.log(`User-Agent: ${req.headers['user-agent']}`);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Query Params:', JSON.stringify(req.query, null, 2));
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('Cookies:', JSON.stringify(req.cookies, null, 2));

    res.on('finish', () => {
      const ms = Date.now() - start;
      const status = res.statusCode;
      const responseHeaders = res.getHeaders();
      const setCookieHeader = responseHeaders['set-cookie'];
      console.log('=== RESPOSTA ===');
      console.log(`Status: ${status} | Tempo: ${ms}ms`);
      console.log('Response Headers:', JSON.stringify(responseHeaders, null, 2));
      if (setCookieHeader) {
        console.log('Set-Cookie:', setCookieHeader);
      }
      console.log('==================\n\n\n\n\n');
    });
    next();
  });

  const configService = app.get<ConfigService<Env, true>>(ConfigService);
  app.useGlobalPipes(new ValidationPipe());
  const port = configService.get('PORT', { infer: true });

  await app.listen(port);
}
bootstrap();
