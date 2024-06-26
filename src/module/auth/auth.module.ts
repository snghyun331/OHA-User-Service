import { Logger, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../../entity/user/user.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import {
  GoogleStrategy,
  KakaoStrategy,
  NaverStrategy,
  JwtStrategy,
  JwtRefreshStrategy,
  AppleStrategy,
} from 'src/auth/strategy';
import { TokenService } from './token.service';
import { HttpModule } from '@nestjs/axios';
import { ProducerService } from '../kafka/kafka.producer.service';
import { ConsumerService } from '../kafka/kafka.consumer.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), PassportModule, JwtModule.register({}), HttpModule.register({})],
  controllers: [AuthController],
  providers: [
    AuthService,
    TokenService,
    ConsumerService,
    ProducerService,
    Logger,
    GoogleStrategy,
    JwtStrategy,
    JwtRefreshStrategy,
    KakaoStrategy,
    NaverStrategy,
    AppleStrategy,
  ],
})
export class AuthModule {}
