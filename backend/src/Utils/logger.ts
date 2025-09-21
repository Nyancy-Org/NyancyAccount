import * as winston from 'winston';
import { format } from 'winston';
import { WinstonModule } from 'nest-winston';
import 'winston-daily-rotate-file';

import dayjs from 'dayjs';

// 获取当前时间并格式化
const nowFileName = dayjs().format('YYYY-MM-DD-HH-mm');

console.log('日志文件名:', nowFileName);

export function getLoggerService() {
  const myFormat = format.combine(
    format.colorize(),
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(
      (info) => `[${info.timestamp}] [${info.level}]: ${info.message}`,
    ),
  );
  const logger = winston.createLogger({
    level: 'debug',
    transports: [
      new winston.transports.Console({
        format: myFormat,
      }),
      new winston.transports.File({
        dirname: 'logs',
        filename: `Error-${nowFileName}.log`,
        level: 'warn',
        format: myFormat,
      }),
      new winston.transports.File({
        dirname: 'logs',
        filename: `All-${nowFileName}.log`,
        format: myFormat,
      }),
    ],
  });
  return WinstonModule.createLogger({
    instance: logger,
  });
}
