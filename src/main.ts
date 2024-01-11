import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SERVER_PORT, SERVER_PORT_2 } from './utils/constant';
import { winstonLogger } from './configs/winston.config';
import * as morgan from 'morgan';

const port = SERVER_PORT || SERVER_PORT_2;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: winstonLogger,
  });

  // app.use(morgan('combined'));  // product
  app.use(morgan('dev')); // dev

  // run server
  try {
    await app.listen(port);
    winstonLogger.log(`Server is listening on port ${port} successfully`);
  } catch (error) {
    winstonLogger.error('Failed to start the app server');
  }
}
bootstrap();
