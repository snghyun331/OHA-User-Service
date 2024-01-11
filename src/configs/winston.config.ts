import { utilities, WinstonModule } from 'nest-winston';
import * as winston from 'winston';

const env = process.env.NODE_ENV;

export const winstonLogger = WinstonModule.createLogger({
  transports: [
    new winston.transports.Console({
      level: env === 'product' ? 'http' : 'silly',
      // production 환경이라면 http, 개발환경이라면 모든 단계를 로그
      format:
        env === 'product'
          ? winston.format.simple()
          : winston.format.combine(
              winston.format.timestamp({
                format: 'YYYY-MM-DD HH:mm:ss',
              }),
              winston.format.colorize(),
              utilities.format.nestLike('USER', { prettyPrint: true }),
            ),
    }),
  ],
});
