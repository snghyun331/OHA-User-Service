import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SERVER_PORT, SERVER_PORT_2 } from './utils/constant';
import { winstonLogger } from './configs/winston.config';
import * as morgan from 'morgan';
import { TransformInterceptor } from './interceptors/response.interceptor';
import { SwaggerConfig } from './configs/swagger.config';
import { SwaggerModule } from '@nestjs/swagger';

const port = SERVER_PORT || SERVER_PORT_2;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: winstonLogger,
  });

  // app.use(morgan('combined'));  // product
  app.use(morgan('dev')); // dev

  // use global interceptors
  app.useGlobalInterceptors(new TransformInterceptor());

  // run swagger
  const config = new SwaggerConfig().initializeOptions();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/swagger', app, document, {
    swaggerOptions: { defaultModelsExpandDepth: -1 },
  });

  // run server
  try {
    await app.listen(port);
    winstonLogger.log(`Server is listening on port ${port} successfully`);
  } catch (error) {
    winstonLogger.error('Failed to start the app server');
  }
}
bootstrap();
