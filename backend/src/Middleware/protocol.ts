import {
  Injectable,
  NestMiddleware,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { logger } from 'src/Utils/log';
import { db } from 'src/Service/mysql';

// 全局跨域中间件
export function GlobalHeaders(req: Request, res: Response, next: NextFunction) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, X-Requested-With, Origin, Accept, Authorization',
  );
  res.header('X-Powered-By', 'https://lazy.ink');
  logger.info(`${req.headers.host} ${req.method} ${req.url}`);
  next();
}

// 检查数据库连接
@Injectable()
export class dbConnect implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    let conn;
    try {
      conn = await db.getConnection();
    } catch (err) {
      logger.error('数据库连接出错');
      throw new HttpException(
        {
          status: false,
          code: HttpStatus.INTERNAL_SERVER_ERROR,
          msg: ':(',
          time: new Date().getTime(),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      if (conn) conn.release();
    }
    next();
  }
}
