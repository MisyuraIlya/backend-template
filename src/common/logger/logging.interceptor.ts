import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  LoggerService,
  Inject,
} from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { v4 as uuid } from 'uuid';
import { Request } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    const req = ctx.switchToHttp().getRequest<Request>();
    
    if (
      req.url === '/metrics' ||
      req.url.startsWith('/metrics/') ||
      req.url === '/api/healthcheck'
    ) {
      return next.handle();
    }

    const start = Date.now();
    const requestId = uuid();
    req.headers['x-request-id'] = requestId;

    return next.handle().pipe(
      tap(() => {
        const durationMs = Date.now() - start;
        this.logger.log({
          level:    'info',
          context:  'HTTP',
          message:  `${req.method} ${req.url}`,
          requestId,
          durationMs,
        });
      }),
    );
  }
}
