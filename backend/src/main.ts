import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
const express = require('express');
const cookieParser = require('cookie-parser');

const server = express();
server.use(cookieParser());

let appPromise: Promise<any> | null = null;

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

  const port = process.env.PORT ?? 4000;
  try {
    await app.listen(port, '0.0.0.0');
    logger.log(`Burgundy Suite & Resort NestJS API running on: http://0.0.0.0:${port}/api`);
  } catch (listenErr) {
    logger.warn(`app.listen bypassed or running in serverless wrapper: ${(listenErr as Error).message}`);
    await app.init();
  }

  return app;
}

// Bootstrap application immediately so Vercel Fluid compute or local dev server is active
appPromise = bootstrap().catch((err) => {
  console.error('Failed to bootstrap NestJS application:', err);
});

// Default export for Vercel Serverless Function entrypoint
export default async function handler(req: any, res: any) {
  await appPromise;
  return server(req, res);
}

// Support CommonJS module.exports for Vercel legacy serverless runners
if (typeof module !== 'undefined' && module.exports) {
  module.exports = handler;
  (module.exports as any).default = handler;
}


