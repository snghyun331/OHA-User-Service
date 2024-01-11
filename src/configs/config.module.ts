import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `src/configs/env/.${process.env.NODE_ENV}.env`,
      isGlobal: true,
    }),
  ],
  exports: [ConfigModule],
})
export class NestConfigModule {}
