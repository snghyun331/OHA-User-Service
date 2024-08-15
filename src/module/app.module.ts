import { Module } from '@nestjs/common';
import { DatabaseModule } from '../config/databse.module';
import { UsersModule } from './user/users.module';
import { AuthModule } from './auth/auth.module';
import { KafkaModule } from './kafka/kafka.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), DatabaseModule, UsersModule, AuthModule, KafkaModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
