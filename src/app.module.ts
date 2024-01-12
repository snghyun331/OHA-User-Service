import { Module } from '@nestjs/common';
import { NestConfigModule } from './configs/config.module';
import { DatabaseModule } from './configs/databse.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [NestConfigModule, DatabaseModule, UsersModule, AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
