import { Logger, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { JwtStrategy } from 'src/auth/strategies/jwt.access.strategy';
import { DiskStorageModule } from 'src/configs/multer.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), DiskStorageModule],
  controllers: [UsersController],
  providers: [UsersService, JwtStrategy, Logger],
})
export class UsersModule {}
