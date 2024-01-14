import { Module } from '@nestjs/common';
import { NestConfigModule } from './configs/config.module';
import { DatabaseModule } from './configs/databse.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ServiceDiscoveryModule } from './configs/eureka.module';

const env = process.env.NODE_ENV;

@Module({
  imports: [
    NestConfigModule,
    DatabaseModule,
    UsersModule,
    AuthModule,
    env === 'dev' ? null : ServiceDiscoveryModule, // 개발 환경이면 ServiceDiscoveryModule 실행 X
  ].filter((module) => module),
  controllers: [],
  providers: [],
})
export class AppModule {}
