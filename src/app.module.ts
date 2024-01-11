import { Module } from '@nestjs/common';
import { NestConfigModule } from './configs/config.module';

@Module({
  imports: [NestConfigModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
