import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx      = host.switchToHttp();
    const res      = ctx.getResponse<Response>();
    const status   =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const responseBody = exception instanceof HttpException
      ? exception.getResponse()
      : { message: 'Internal server error' };

    let message: string;
    if (typeof responseBody === 'string') {
      message = responseBody;
    } else if (
      typeof responseBody === 'object' &&
      (responseBody as any).message
    ) {
      const m = (responseBody as any).message;
      message = Array.isArray(m) ? m.join('; ') : String(m);
    } else {
      message = 'Unexpected error';
    }

    res.status(status).json({
      data:    null,
      status:  false,
      message,
    });
  }
}