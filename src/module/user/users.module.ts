import { Logger, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../../entity/user.entity';
import { JwtStrategy } from '../../auth/strategy/jwt/jwt.access.strategy';
import { DiskStorageModule } from '../../config/multer.module';
import { ConsumerService } from '../kafka/kafka.consumer.service';
import { ProducerService } from '../kafka/kafka.producer.service';
import { TokenService } from '../auth/token.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), DiskStorageModule, JwtModule.register({})],
  controllers: [UsersController],
  providers: [UsersService, JwtStrategy, Logger, ConsumerService, ProducerService, TokenService],
})
export class UsersModule {}
