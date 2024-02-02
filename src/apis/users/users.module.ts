import { Logger, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { JwtStrategy } from 'src/strategies/jwt.access.strategy';
import { DiskStorageModule } from 'src/configs/multer.module';
import { HttpModule } from '@nestjs/axios';
import { UserFreqDistrictEntity } from './entities/user-freq-locations.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, UserFreqDistrictEntity]), DiskStorageModule, HttpModule.register({})],
  controllers: [UsersController],
  providers: [UsersService, JwtStrategy, Logger],
})
export class UsersModule {}
