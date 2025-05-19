import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
  } from '@nestjs/common';
  import { Observable } from 'rxjs';
  import { tap } from 'rxjs/operators';
  import { AppLogger } from './logger.service';
  
  @Injectable()
  export class LoggingInterceptor implements NestInterceptor {
    constructor(private readonly logger: AppLogger) {}
  
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      const req = context.switchToHttp().getRequest();
      const { method, url, body, params, query } = req;
      const now = Date.now();
  
      this.logger.log(
        `[Request] ${method} ${url} - Body: ${JSON.stringify(body)} - Params: ${JSON.stringify(params)} - Query: ${JSON.stringify(query)}`
      );
  
      return next.handle().pipe(
        tap((data) => {
          const res = context.switchToHttp().getResponse();
          const { statusCode } = res;
          const responseTime = Date.now() - now;
          this.logger.log(
            `[Response] ${method} ${url} ${statusCode} - ${responseTime}ms - Response: ${JSON.stringify(data)}`
          );
        }),
      );
    }
  }
  