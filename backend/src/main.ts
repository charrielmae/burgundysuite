import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
const cookieParser = require('cookie-parser');

async function bootstrap() {
  const logger = new Logger('BurgundySuiteBackend');
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:4000',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'cf-access-authenticated-user-email',
      'cf-access-jwt-assertion',
    ],
  });

  app.setGlobalPrefix('api');

  const port = process.env.PORT || 4000;
  await app.listen(port);
  logger.log(`Burgundy Suite & Resort NestJS API running on: http://localhost:${port}/api`);
}
bootstrap();
