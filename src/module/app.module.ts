import { Module } from '@nestjs/common';
import { DATABASE_CONFIG } from '../config/databse.config';
import { UsersModule } from './user/users.module';
import { AuthModule } from './auth/auth.module';
import { KafkaModule } from './kafka/kafka.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync(DATABASE_CONFIG),
    UsersModule,
    AuthModule,
    KafkaModule,
  ],
})
export class AppModule {}
