import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  LoggerService,
  Inject,
} from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Request, Response } from 'express';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { QueryFailedError } from 'typeorm';

@Catch(HttpException, QueryFailedError, Error)
export class ServerErrorFilter implements ExceptionFilter {
  constructor(@Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService) {}

  async catch(exception: HttpException | QueryFailedError | Error, host: ArgumentsHost) {
    const ctx: HttpArgumentsHost = host.switchToHttp();
    const response: Response = ctx.getResponse<Response>();
    const request: Request = ctx.getRequest<Request>();
    const clientIp = request.headers['x-forwarded-for'];
    const method: string = request.method;
    const originalUrl: string = request.originalUrl;
    const params = JSON.stringify(request.params);
    const body = JSON.stringify(request.body);
    const query = JSON.stringify(request.query);
    const timeStamp: string = new Date().toLocaleString('ko-KR');

    if (request) {
      this.logger.error(
        `(${clientIp}) Path: ${originalUrl}, Method: ${method}, Params: ${params}, Body: ${body}, Query: ${query} \n ⛔️ ${exception.stack}`,
      );
    }

    if (exception instanceof HttpException) {
      /* 의도적으로 발생한 Error 처리 */
      const status: number = exception.getStatus();
      const err: string | object = exception.getResponse();
      const errReponse = typeof err === 'string' ? { message: err } : err;
      const errResponseBody: object = { ...errReponse, timeStamp, path: request.url };
      return response.status(status).json(errResponseBody);
    } else {
      /* 알 수 없는 DB 혹은 Node 에러의 경우 */
      const status: number = HttpStatus.INTERNAL_SERVER_ERROR;
      const message: string = exception instanceof QueryFailedError ? '쿼리 장애 발생' : '알 수 없는 에러 발생';
      const errResponseBody: object = { statusCode: status, message, timeStamp, path: request.url };
      return response.status(status).json(errResponseBody);
    }
  }
}
