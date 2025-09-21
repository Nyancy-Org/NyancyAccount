import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { db } from 'src/services/mysql';
import config from 'src/services/config';

// 全局跨域中间件
export function GlobalHeaders(req: Request, res: Response, next: NextFunction) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, X-Requested-With, Origin, Accept, Authorization',
  );
  res.header('X-Powered-By', 'https://lazy.ink');

  const ip = config.isCdn
    ? (req.headers['x-forwarded-for'] as string).split(',')[0]
    : config.isReverseProxy
      ? req.headers['x-real-ip']
      : req.socket.remoteAddress;
  Logger.log(`${ip} ${req.method} ${req.url}`);
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
      Logger.error('数据库连接出错：' + err.message);
      throw new Error(':(');
    } finally {
      if (conn) conn.release();
    }
    next();
  }
}
