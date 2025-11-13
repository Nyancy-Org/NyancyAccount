import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { map } from 'rxjs/operators';
import { NyaResponse } from 'src/types';
import { GLOBAL_PREFIX } from 'src/types/const';

@Injectable()
export class GlobalResponseInterceptor implements NestInterceptor {
  constructor() {
    Logger.log('GlobalResponseInterceptor 已启动');
  }

  // OAuth2 接口不进行格式化
  private readonly ignoredRoutes = [`/${GLOBAL_PREFIX}/oauth2/token`];

  intercept(context: ExecutionContext, next: CallHandler) {
    const ctx = context.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    const statusCode = res.statusCode;

    // 检查当前请求路径是否在忽略列表中
    if (this.ignoredRoutes.some((url) => req.url.startsWith(url))) {
      // 直接返回原始数据
      return next.handle();
    }

    return next.handle().pipe(
      map(({ msg: m, data }) => {
        const res: NyaResponse<any> = {
          code: statusCode,
          msg: m ?? 'success',
          data,
          time: Date.now(),
        };
        return res;
      }),
    );
  }
}
