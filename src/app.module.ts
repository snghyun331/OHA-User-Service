import { Module } from '@nestjs/common';
import { NestConfigModule } from './configs/config.module';
import { DatabaseModule } from './configs/databse.module';

@Module({
  imports: [NestConfigModule, DatabaseModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
