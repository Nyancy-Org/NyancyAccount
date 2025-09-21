import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { v4 } from 'uuid';
import { AppModule } from './app.module';
import config from './services/config';
import { GlobalHeaders } from './middlewares/protocol';
import { GlobalExceptionFilter } from './middlewares/exceptionFilter';
import session from 'express-session';
import { getLoggerService } from './utils/logger';

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
  app.useGlobalFilters(new GlobalExceptionFilter());

  await app.listen(config.httpPort);
  Logger.log(`服务已启动：${await app.getUrl()}`);
}
bootstrap();
