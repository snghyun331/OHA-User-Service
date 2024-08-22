import { Inject, Injectable, LoggerService, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(@Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();

    res.on('finish', async () => {
      const ip: string = req.ip;
      const method: string = req.method;
      const originalUrl: string = req.originalUrl;
      const statusCode: number = res.statusCode;
      const endTime: number = Date.now();
      const delay: number = (endTime - startTime) / 1000;

      this.logger.log(`${ip} ${originalUrl} ${method} ${statusCode} - ${delay}ms`);
    });
    next();
  }
}
