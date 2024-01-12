import { Logger, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { GoogleStrategy } from './strategies/google.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.access.strategy';
import { JwtRefreshStrategy } from './strategies/jwt.refresh.strategy';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), PassportModule, JwtModule.register({})],
  controllers: [UsersController],
  providers: [UsersService, Logger, GoogleStrategy, GoogleStrategy, JwtStrategy, JwtRefreshStrategy],
})
export class UsersModule {}
