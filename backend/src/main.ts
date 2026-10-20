import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
const cookieParser = require('cookie-parser');

async function bootstrap() {
  const logger = new Logger('BurgundySuiteBackend');
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.enableCors({
    origin: (origin, callback) => {
      // In Vercel services mode, requests share the top-level domain; also permit localhost & vercel previews
      callback(null, true);
    },
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

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');
  logger.log(`Burgundy Suite & Resort NestJS API running on: http://0.0.0.0:${port}/api`);
}
bootstrap();
