import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { winstonLogger } from './configs/winston.config';
import * as morgan from 'morgan';
import { TransformInterceptor } from './interceptors/response.interceptor';
import { SwaggerConfig } from './configs/swagger.config';
import { SwaggerModule } from '@nestjs/swagger';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { ValidationPipe } from '@nestjs/common';
import { eurekaClient } from './configs/eureka.config';

const port = process.env.PORT1 || process.env.PORT2;
const env = process.env.NODE_ENV;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: winstonLogger,
  });

  // cors settings
  const corsOptions: CorsOptions = {
    credentials: true,
  };
  app.enableCors(corsOptions);

  // app.use(morgan('combined'));  // product
  app.use(morgan('dev')); // dev

  // use global pipe
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // use global interceptors
  app.useGlobalInterceptors(new TransformInterceptor());

  // run swagger
  const config = new SwaggerConfig().initializeOptions();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/user/swagger', app, document, {
    swaggerOptions: { defaultModelsExpandDepth: -1 },
  });

  // run server
  try {
    await app.listen(port);
    if (env === 'product') {
      eurekaClient.logger.level('log');
      eurekaClient.start();
    }
    winstonLogger.log(`Server is running on http port ${port}`);
  } catch (error) {
    winstonLogger.error('Failed to start the app server');
  }
}
bootstrap();
