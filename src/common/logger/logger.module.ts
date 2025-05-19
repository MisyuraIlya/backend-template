import { Module } from '@nestjs/common';
import { WinstonModule, utilities as nestWinstonModuleUtilities } from 'nest-winston';
import * as winston from 'winston';
import LokiTransport = require('winston-loki');

@Module({
  imports: [
    WinstonModule.forRoot({
      level: process.env.LOG_LEVEL || 'info',
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp({ format: 'MM/DD/YYYY, hh:mm:ss A' }),
            nestWinstonModuleUtilities.format.nestLike(),
          ),
        }),
        new LokiTransport({
          host:   process.env.LOKI_HOST || 'http://loki:3100',
          labels: { service: process.env.SERVICE_NAME || 'app-service' },
          json:   true,
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
      ],
    }),
  ],
  providers: [],
  exports: [
    WinstonModule,         
  ],
})
export class LoggerModule {}
