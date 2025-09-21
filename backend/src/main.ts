import { NestFactory } from '@nestjs/core';
import {
  BadRequestException,
  Logger,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { v4 } from 'uuid';
import { AppModule } from './app.module';
import config from './services/config';
import { GlobalHeaders } from './middlewares/protocol';
import { GlobalExceptionFilter } from './interceptors/http-exception.filter';
import session from 'express-session';
import { getLoggerService } from './utils/logger';
import { GlobalResponseInterceptor } from './interceptors/response';

async function bootstrap() {
  console.log(`

███╗   ██╗██╗   ██╗ █████╗ ███╗   ██╗ ██████╗██╗   ██╗
████╗  ██║╚██╗ ██╔╝██╔══██╗████╗  ██║██╔════╝╚██╗ ██╔╝
██╔██╗ ██║ ╚████╔╝ ███████║██╔██╗ ██║██║      ╚████╔╝ 
██║╚██╗██║  ╚██╔╝  ██╔══██║██║╚██╗██║██║       ╚██╔╝  
██║ ╚████║   ██║   ██║  ██║██║ ╚████║╚██████╗   ██║   
╚═╝  ╚═══╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═══╝ ╚═════╝   ╚═╝   
  
  + Copyright (C) ${new Date().getFullYear()} Lazy All right reserved
  `);
  const app = await NestFactory.create(AppModule, {
    logger: getLoggerService(),
  });

  app.use(
    session({
      secret: v4(),
      resave: false,
      cookie: {
        maxAge: 60 * 1000 * 60 * 240,
        // maxAge: 10,
      },
      saveUninitialized: true,
    }),
  );
  app.use(GlobalHeaders);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 自动剔除 DTO 中未定义的字段，如 "test"
      forbidNonWhitelisted: true, // 如果有未定义的字段，抛出错误
      transform: true,
      exceptionFactory: (errors: ValidationError[]) => {
        // 提取最后一个错误消息
        const firstError = Object.values(errors[0].constraints).reverse()[0];
        return new BadRequestException(firstError);
      },
    }),
  );
  app.useGlobalInterceptors(new GlobalResponseInterceptor());
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.setGlobalPrefix('api');

  await app.listen(config.httpPort);
  Logger.log(`服务已启动：${await app.getUrl()}`);
}
bootstrap();
