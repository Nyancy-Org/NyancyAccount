import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  Logger,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { NyaResponse } from 'src/types';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor() {
    Logger.log('GlobalExceptionFilter 已启动');
  }

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    Logger.error(
      `[${status}] ${request.headers['x-real-ip'] || request.socket.remoteAddress} [${request.method}] ${request.url} ${status >= 500 ? '🤣👉 ' + exception.stack : ''}`,
    );

    const sendBody: NyaResponse<null> = {
      code: status,
      msg: exception?.message,
      data: null,
      time: Date.now(),
      path: request.originalUrl,
    };

    response.status(status).json(sendBody);
  }
}
