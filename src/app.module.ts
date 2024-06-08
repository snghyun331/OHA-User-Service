import { Module } from '@nestjs/common';
import { NestConfigModule } from './configs/config.module';
import { DatabaseModule } from './configs/databse.module';
import { UsersModule } from './apis/users/users.module';
import { AuthModule } from './apis/auth/auth.module';
import { KafkaModule } from './kafka/kafka.module';

@Module({
  imports: [NestConfigModule, DatabaseModule, UsersModule, AuthModule, KafkaModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
