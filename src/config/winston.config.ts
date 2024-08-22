import * as winston from 'winston';
import * as winstonDaily from 'winston-daily-rotate-file';
import * as moment from 'moment-timezone';

const dailyOptions = (level: string) => {
  return {
    level,
    datePattern: 'YYYYMMDD',
    dirname: `logs/${level}`,
    filename: `%DATE%_${level}.log`,
    maxFiles: 2, // 2일치 로그파일 저장
    zippedArchive: true, // 로그가 쌓이면 압축하여 관리
    format: winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
      }),
      winston.format.printf(({ level, message, timestamp, stack, context }) => {
        return `${timestamp} [${level}]: ${message} ${stack ? stack : ''} ${context ? JSON.stringify(context) : ''}`;
      }),
    ),
  };
};

export const WINSTON_CONFIG = {
  transports: [
    new winston.transports.Console({
      level: 'info',
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.timestamp({
          format: () => moment().tz('Asia/Seoul').format('MM-DD HH:mm:ss'),
        }),
        winston.format.printf(({ level, message, timestamp, stack, context }) => {
          return `${timestamp} [${level}]: ${message} ${stack ? stack : ''} ${context ? JSON.stringify(context) : ''}`;
        }),
      ),
    }),
    new winstonDaily(dailyOptions('error')),
  ],
};
