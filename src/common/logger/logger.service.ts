import { Injectable, LoggerService } from '@nestjs/common';
import { createLogger, format, transports, Logger } from 'winston';
const LokiTransport = require('winston-loki');

@Injectable()
export class AppLogger implements LoggerService {
  private readonly logger: Logger;

  constructor() {
    this.logger = createLogger({
      level: process.env.LOG_LEVEL || 'debug',
      format: format.combine(
        format.timestamp(),
        format.errors({ stack: true }),
        format.splat(),
        format.json(),
      ),
      transports: [
        new transports.Console(),
        new LokiTransport({
          host: process.env.LOKI_HOST || 'http://loki:3100',
          labels: { service: process.env.SERVICE_NAME || 'app-service' },
          json: true,
          level: process.env.LOG_LEVEL || 'debug',
        }),
      ],
    });
  }

  log(message: string, ...meta: any[]) {
    this.logger.info(message, ...meta);
  }

  error(message: string, trace: string, ...meta: any[]) {
    this.logger.error(message, { trace, ...meta });
  }

  warn(message: string, ...meta: any[]) {
    this.logger.warn(message, ...meta);
  }

  debug(message: string, ...meta: any[]) {
    this.logger.debug(message, ...meta);
  }

  verbose(message: string, ...meta: any[]) {
    this.logger.verbose(message, ...meta);
  }
}