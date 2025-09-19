import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { logger } from './Utils/log';
import config from './services/config';

import { GlobalHeaders } from './middlewares/protocol';
import { GlobalExceptionFilter } from './middlewares/exceptionFilter';

import session from 'express-session';

async function bootstrap() {
  logger.info(`

███╗   ██╗██╗   ██╗ █████╗ ███╗   ██╗ ██████╗██╗   ██╗
████╗  ██║╚██╗ ██╔╝██╔══██╗████╗  ██║██╔════╝╚██╗ ██╔╝
██╔██╗ ██║ ╚████╔╝ ███████║██╔██╗ ██║██║      ╚████╔╝ 
██║╚██╗██║  ╚██╔╝  ██╔══██║██║╚██╗██║██║       ╚██╔╝  
██║ ╚████║   ██║   ██║  ██║██║ ╚████║╚██████╗   ██║   
╚═╝  ╚═══╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═══╝ ╚═════╝   ╚═╝   
  
  + Copyright (C) ${new Date().getFullYear()} Lazy All right reserved
  `);
  const app = await NestFactory.create(AppModule);
  app.use(GlobalHeaders);
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.use(
    session({
      secret: config.sessionSecret,
      resave: false,
      cookie: {
        maxAge: 60 * 1000 * 60 * 240,
        // maxAge: 10,
      },
      saveUninitialized: true,
    }),
  );
  await app.listen(config.httpPort);
  logger.info(`服务已启动：${await app.getUrl()}`);
}
bootstrap();
