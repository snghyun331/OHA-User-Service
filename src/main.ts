import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { winstonLogger } from './configs/winston.config';
import * as morgan from 'morgan';
import { TransformInterceptor } from './interceptors/response.interceptor';
import { SwaggerConfig } from './configs/swagger.config';
import { SwaggerModule } from '@nestjs/swagger';
import { Transport } from '@nestjs/microservices';

const port = process.env.PORT1 || process.env.PORT2;

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
    await app.connectMicroservice({
      transport: Transport.TCP,
      options: {
        host: process.env.MS_HOST,
        port: process.env.MS_PORT,
      },
    });
    await app.startAllMicroservices();
    winstonLogger.log(`Server is running on TCP with http port ${port}`);
  } catch (error) {
    winstonLogger.error('Failed to start the app server');
  }
}
bootstrap();
