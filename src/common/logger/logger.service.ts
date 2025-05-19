import { Injectable, LoggerService } from '@nestjs/common';
import { createLogger, format, transports, Logger } from 'winston';
const LokiTransport = require('winston-loki');
import * as colors from 'colors/safe';
import { v4 as uuidv4 } from 'uuid';
import { TransformableInfo } from 'logform';

const { combine, timestamp, json, printf } = format;

// Our custom info shape
interface CustomLogInfo extends TransformableInfo {
  timestamp: string;
  level:     string;
  message:   string;
  correlationId?: string;
  request?:       any;
  response?:      any;
}

@Injectable()
export class AppLogger implements LoggerService {
  private readonly logger: Logger = createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: combine(
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      json(),
      AppLogger.logFormat(),
    ),
    transports: [
      new transports.Console(),
      new LokiTransport({
        host:   process.env.LOKI_HOST || 'http://loki:3100',
        labels: { service: process.env.SERVICE_NAME || 'app-service' },
        json:   true,
      }),
    ],
  });

  log(message: any, ...optionalParams: any[]): void {
    const [ctx] = optionalParams;
    const correlationId = (ctx?.correlationId as string) || uuidv4();
    this.logger.info(message, { ...ctx, correlationId });
  }

  error(message: any, ...optionalParams: any[]): void {
    const [traceOrCtx, maybeCtx] = optionalParams;
    const trace   = typeof traceOrCtx === 'string' ? traceOrCtx : undefined;
    const ctx     = typeof traceOrCtx === 'string' ? maybeCtx : traceOrCtx;
    const correlationId = (ctx?.correlationId as string) || uuidv4();

    this.logger.error(message, { trace, ...ctx, correlationId });
  }

  warn(message: any, ...optionalParams: any[]): void {
    const [ctx] = optionalParams;
    const correlationId = (ctx?.correlationId as string) || uuidv4();
    this.logger.warn(message, { ...ctx, correlationId });
  }

  debug(message: any, ...optionalParams: any[]): void {
    const [ctx] = optionalParams;
    const correlationId = (ctx?.correlationId as string) || uuidv4();
    this.logger.debug(message, { ...ctx, correlationId });
  }

  verbose(message: any, ...optionalParams: any[]): void {
    const [ctx] = optionalParams;
    const correlationId = (ctx?.correlationId as string) || uuidv4();
    this.logger.verbose(message, { ...ctx, correlationId });
  }

  private static logFormat() {
    return printf((info: CustomLogInfo) => {
      const {
        timestamp,
        level,
        message,
        correlationId = '',
        request,
        response,
        ...rest
      } = info;

      const lvl = level.toUpperCase();
      const coloredLevel = ({
        error: colors.red(lvl),
        warn:  colors.yellow(lvl),
        info:  colors.green(lvl),
        debug: colors.blue(lvl),
      }[level] || lvl);

      let out = `${colors.gray(timestamp)} ${coloredLevel} [${colors.magenta(correlationId)}] ${message}`;

      if (request) {
        out += `\n  ${colors.gray('Request:')} ${JSON.stringify(request)}`;
      }
      if (response) {
        out += `\n  ${colors.cyan('Response:')} ${JSON.stringify(response)}`;
      }
      if (Object.keys(rest).length) {
        out += `\n  ${colors.gray('Meta:')} ${JSON.stringify(rest)}`;
      }

      return out;
    });
  }
}
