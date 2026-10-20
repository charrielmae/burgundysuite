import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
const express = require('express');
const cookieParser = require('cookie-parser');

const server = express();
server.use(cookieParser());
let isInitialized = false;

async function bootstrap() {
  const logger = new Logger('BurgundySuiteBackend');
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  app.use(cookieParser());

  app.enableCors({
    origin: (origin: string, callback: Function) => {
      // In Vercel services mode, requests share the top-level domain; also permit localhost & vercel previews
      callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Admin-Token',
      'x-admin-token',
      'cf-access-authenticated-user-email',
      'cf-access-jwt-assertion',
    ],
  });

  app.setGlobalPrefix('api');
  await app.init();
  isInitialized = true;

  // If running locally as a standalone server
  if (!process.env.VERCEL && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
    const port = process.env.PORT ?? 4000;
    await app.listen(port, '0.0.0.0');
    logger.log(`Burgundy Suite & Resort NestJS API running on: http://0.0.0.0:${port}/api`);
  }
  return app;
}

// For local standalone execution
if (!process.env.VERCEL && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
  bootstrap();
}

// Default export for Vercel Serverless Function entrypoint
export default async function handler(req: any, res: any) {
  if (!isInitialized) {
    await bootstrap();
  }
  return server(req, res);
}

