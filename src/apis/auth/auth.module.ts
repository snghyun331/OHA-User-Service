import { Logger, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../users/entities/user.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import {
  GoogleStrategy,
  KakaoStrategy,
  NaverStrategy,
  JwtStrategy,
  JwtRefreshStrategy,
  AppleStrategy,
} from 'src/strategies';
import { TokenService } from './token.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), PassportModule, JwtModule.register({}), HttpModule.register({})],
  controllers: [AuthController],
  providers: [
    AuthService,
    TokenService,
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
