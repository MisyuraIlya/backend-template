import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import { join } from 'path';
import * as cookieParser from 'cookie-parser';
import { RequestMethod } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));
  app.setGlobalPrefix('api', {
    exclude: [
      { path: 'metrics', method: RequestMethod.GET },
      { path: 'metrics/(.*)', method: RequestMethod.GET },
    ],
  });
  app.use(cookieParser());
    app.enableCors({
    origin: 'http://localhost:5173', 
    credentials: true,               
  });
  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
