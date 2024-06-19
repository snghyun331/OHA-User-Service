import { Module } from '@nestjs/common';
import { NestConfigModule } from '../config/config.module';
import { DatabaseModule } from '../config/databse.module';
import { UsersModule } from './user/users.module';
import { AuthModule } from './auth/auth.module';
import { KafkaModule } from './kafka/kafka.module';

@Module({
  imports: [NestConfigModule, DatabaseModule, UsersModule, AuthModule, KafkaModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
