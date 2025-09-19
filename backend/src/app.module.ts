import {
  Module,
  NestModule,
  MiddlewareConsumer,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
// 接口速率限制
import { RateLimiterModule, RateLimiterGuard } from 'nestjs-rate-limiter';
import { dbConnect } from './Middleware/protocol';

import { MainModule } from './modules/main/main.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './user/user.module';
import { Oauth2Module } from './modules/oauth2/oauth2.module';
import { SiteModule } from './site/site.module';

@Module({
  imports: [
    RateLimiterModule.register({
      for: 'Express',
      type: 'Memory',
      keyPrefix: 'global',
      points: 25, //即每秒最多允许多少次次请求。
      pointsConsumed: 1, //每次请求消耗的点数。
      // 例如，如果将points设置为10，pointsConsumed设置为2，那么每个时间窗口内的最大请求数将是5（10/2）。
      // 这意味着每个请求将消耗2个点数，因此在时间窗口内最多可以进行5个请求。
      inmemoryBlockOnConsumed: 1, //在达到请求限制时，是否阻止进一步的请求。设置为 0 表示不阻止。
      duration: 1,
      blockDuration: 30, //当达到请求限制时，阻止请求的持续时间（以秒为单位）。设置为 0，即不阻止请求。(retry-after: ?s)
      inmemoryBlockDuration: 0, //在请求被阻止时的持续时间（以秒为单位）。设置为 0，即请求被阻止时没有特定的持续时间。
      queueEnabled: false, //是否启用请求队列，以便在达到请求限制时按顺序处理请求。
      whiteList: [], //白名单，包含不受速率限制的 IP 地址或其他标识符。
      blackList: [], //被禁止访问的 IP 地址或其他标识符。
      clearExpiredByTimeout: true, //是否通过超时自动清除过期的限制器。
      execEvenly: true, //是否均匀分配请求速率。
      execEvenlyMinDelayMs: undefined, //最小延迟时间（以毫秒为单位）
      maxQueueSize: 233, //请求队列的最大大小
      omitResponseHeaders: false, //是否忽略响应头。
      // errorMessage: 'Rate limit exceeded', //自定义超过速率限制时返回的错误消息。
      logger: true,
      customResponseSchema: (req) => {
        throw new HttpException(
          {
            msg: `你的操作太快了，请等待${Math.round(
              req.msBeforeNext / 1000,
            )}秒后重试`,
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      },
    }),
    MainModule,
    AuthModule,
    UserModule,
    Oauth2Module,
    SiteModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RateLimiterGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(dbConnect).forRoutes('auth', 'user');
  }
}
