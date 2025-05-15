// src/common/interceptors/response.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResponseDto } from '../dto/response.dto';

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ResponseDto<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ResponseDto<T>> {
    return next.handle().pipe(
      map((payload: any) => {
        let message: string | null = null;
        let data: any = payload;

        if (payload && typeof payload === 'object' && 'message' in payload) {
          message = payload.message;
          const { message: _, ...rest } = payload;
          data = rest;
        }

        if (
          data &&
          typeof data === 'object' &&
          !Array.isArray(data) &&
          Object.keys(data).length === 0
        ) {
          data = null;
        }

        return {
          data,
          status: true,
          message,
        };
      }),
    );
  }
}
