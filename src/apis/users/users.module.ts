import { Logger, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { JwtStrategy } from 'src/strategies/jwt/jwt.access.strategy';
import { DiskStorageModule } from 'src/configs/multer.module';
import { ConsumerService } from 'src/kafka/kafka.consumer.service';
import { ProducerService } from 'src/kafka/kafka.producer.service';
import { TokenService } from '../auth/token.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), DiskStorageModule, JwtModule.register({}),],
  controllers: [UsersController],
  providers: [UsersService, JwtStrategy, Logger, ConsumerService, ProducerService, TokenService,],
})
export class UsersModule {}
