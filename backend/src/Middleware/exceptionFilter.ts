import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { logger } from '../Utils/log';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor() {
    logger.info('已装载全局错误捕获装置');
  }

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let resp: { msg?: string; error?: string };
    try {
      resp = exception.getResponse() as { msg?: string; error?: string };
    } catch (err) {
      logger.error(exception);
      resp = { msg: exception.text || exception.message };
    }

    response.status(status).json({
      code: status,
      msg: resp.msg || resp.error,
      time: new Date().getTime(),
      path: request.originalUrl,
    });

    logger.error(
      `[${status}] ${request.ip} [${request.method}] ${request.originalUrl}`,
    );
  }
}
