import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { map } from 'rxjs/operators';
import { NyaResponse } from 'src/types';

@Injectable()
export class GlobalResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    // const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse();
    const statusCode = res.statusCode;

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
