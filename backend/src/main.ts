import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
const express = require('express');
const cookieParser = require('cookie-parser');

const server = express();
server.use(cookieParser());

let isInitialized = false;
let initPromise: Promise<any> | null = null;

async function bootstrap(): Promise<any> {
  const logger = new Logger('BurgundySuiteBackend');
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  app.use(cookieParser());

  app.enableCors({
    origin: (origin: string, callback: Function) => {
      // Allow all origins in production and development
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
  await app.listen(port, '0.0.0.0');
  logger.log(`Burgundy Suite & Resort NestJS API running on: http://0.0.0.0:${port}/api`);

  isInitialized = true;
  return server;
}

// Bootstrap application immediately so server listens on process.env.PORT
initPromise = bootstrap().catch((err) => {
  console.error('Fatal backend bootstrap error:', err);
});

// Default export for Vercel Serverless Function entrypoint
export default async function handler(req: any, res: any) {
  try {
    if (!isInitialized && initPromise) {
      await initPromise;
    }

    if (req.url && !req.url.startsWith('/api')) {
      req.url = `/api${req.url.startsWith('/') ? '' : '/'}${req.url}`;
    }

    return server(req, res);
  } catch (err: any) {
    console.error('Fatal backend handler error:', err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          success: false,
          error: err?.message || 'Internal Server Error',
        })
      );
    }
  }
}

// Support CommonJS module.exports for Vercel legacy serverless runners
if (typeof module !== 'undefined' && module.exports) {
  module.exports = handler;
  (module.exports as any).default = handler;
}





