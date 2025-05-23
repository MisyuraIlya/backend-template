import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import { join } from 'path';
import * as cookieParser from 'cookie-parser';
import { RequestMethod } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));
  app.setGlobalPrefix('api', {
    exclude: [
      { path: 'metrics', method: RequestMethod.GET },
      { path: 'metrics/(.*)', method: RequestMethod.GET },
    ],
  });

  app.use(helmet());
  app.use(cookieParser());

  const allowedOrigins = [
    process.env.FRONTEND_URL,
    process.env.BACKEND_URL,
    'https://digi-dev.work',
  ];
  const localhostRegex = /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/;

  const isDev = process.env.NODE_ENV !== 'production';

  app.enableCors({
    origin: (origin, callback) => {
      if (isDev) {
        if (!origin || localhostRegex.test(origin)) {
          return callback(null, true);
        }
        return callback(new Error(`Dev mode: Origin ${origin} not allowed`));
      }

      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Set-Cookie'],
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
