import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from "@nestjs/common";
import { HttpStatusCode } from "axios";
// import { Request } from "express";
import { map } from "rxjs/operators";
import { NyaResponse } from "src/types";

@Injectable()
export class GlobalResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    // const req = context.switchToHttp().getRequest<Request>();

    return next.handle().pipe(
      map(({ code: c, msg: m, data }) => {
        const res: NyaResponse<any> = {
          code: c ?? HttpStatusCode.Ok,
          msg: m ?? "success",
          data,
          time: Date.now(),
        };
        return res;
      }),
    );
  }
}
