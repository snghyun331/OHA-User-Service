import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { DATABASE_CONFIG } from '../config/databse.config';
import { UsersModule } from './user/users.module';
import { AuthModule } from './auth/auth.module';
import { KafkaModule } from './kafka/kafka.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerMiddleware } from 'src/common/middleware/logger.middleware';
import { WinstonModule } from 'nest-winston';
import { WINSTON_CONFIG } from 'src/config/winston.config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync(DATABASE_CONFIG),
    WinstonModule.forRoot(WINSTON_CONFIG),
    UsersModule,
    AuthModule,
    KafkaModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
