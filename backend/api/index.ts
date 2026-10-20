import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
const express = require('express');
const cookieParser = require('cookie-parser');

const server = express();
server.use(cookieParser());

let isInitialized = false;
let initPromise: Promise<any> | null = null;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  app.use(cookieParser());

  app.enableCors({
    origin: (origin: string, callback: Function) => callback(null, true),
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
  return server;
}

export default async function handler(req: any, res: any) {
  try {
    if (!isInitialized) {
      if (!initPromise) {
        initPromise = bootstrap();
      }
      await initPromise;
    }

    if (req.url && !req.url.startsWith('/api')) {
      req.url = `/api${req.url.startsWith('/') ? '' : '/'}${req.url}`;
    }

    return server(req, res);
  } catch (err: any) {
    console.error('Vercel API handler error:', err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: err?.message || 'Server error' }));
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = handler;
  (module.exports as any).default = handler;
}
