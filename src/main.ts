import { NestFactory } from '@nestjs/core';
import { AppModule } from './module/app.module';
import { winstonLogger } from './config/winston.config';
import * as morgan from 'morgan';
import { TransformInterceptor } from './common/interceptor/response.interceptor';
import { setupSwagger } from './config/swagger.config';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { ValidationPipe } from '@nestjs/common';
import { EurekaClient } from './config/eureka.config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { validationOptions } from './config/validation.config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
    logger: winstonLogger,
  });

  const configService: ConfigService = app.get(ConfigService);
  const env: string = configService.get<string>('NODE_ENV');
  const SERVER_PORT: number = configService.get<number>('PORT');

  app.set('trust proxy', true);

  // cors settings
  const corsOptions: CorsOptions = {
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  };
  app.enableCors(corsOptions);

  // app.use(morgan('combined'));  // product
  // app.use(morgan('dev')); // dev

  // use global pipe
  app.useGlobalPipes(new ValidationPipe(validationOptions));

  // use global interceptors
  app.useGlobalInterceptors(new TransformInterceptor());

  // swagger setting
  setupSwagger(app);

  // run server
  try {
    await app.listen(SERVER_PORT);
    if (env === 'dev' || env === 'prod') {
      EurekaClient.logger.level('log');
      EurekaClient.start();
    }
    winstonLogger.log(`✅ Server is listening on port ${SERVER_PORT}`);
  } catch (e) {
    winstonLogger.error(e);
    winstonLogger.error('⛔️ Failed to start the app server');
  }
}
bootstrap();
