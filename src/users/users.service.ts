import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  LoggerService,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  constructor(
    @Inject(Logger)
    private readonly logger: LoggerService,
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    private configService: ConfigService,
  ) {}

  async updateNickname(userId, updateNameDto, transactionManager) {
    try {
      const { name } = updateNameDto;
      await this.checkNicknameExists(name, userId);
      await transactionManager.update(UserEntity, userId, { name });
      return;
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async uploadProfile(userId: number, filename: string, transactionManager: EntityManager) {
    try {
      const user = await this.usersRepository.findOne({ where: { userId } });
      if (!user) {
        throw new NotFoundException('존재하지 않는 사용자입니다');
      }
      const url = `http://${this.configService.get('HOST')}:${+this.configService.get(
        'PORT1',
      )}/api/user/uploads/${filename}`;
      const result = await transactionManager.update(UserEntity, userId, { profileUrl: url });
      if (result.affected === 0) {
        throw new BadRequestException('Profile update failed: Invalid input data');
      }
      return { imageUrl: url };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async uploadBGImage(userId: number, filename: string, transactionManager: EntityManager) {
    try {
      const user = await this.usersRepository.findOne({ where: { userId } });
      if (!user) {
        throw new NotFoundException('존재하지 않는 사용자입니다');
      }
      const url = `http://${this.configService.get('HOST')}:${+this.configService.get(
        'PORT1',
      )}/api/user/uploads/${filename}`;
      const result = await transactionManager.update(UserEntity, userId, { backgroundUrl: url });
      if (result.affected === 0) {
        throw new BadRequestException('Profile update failed: Invalid input data');
      }
      return { imageUrl: url };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async getUserInfo(userId: number, providerId: string) {
    try {
      const user = this.usersRepository.findOne({ where: { userId, providerId } });
      if (!user) {
        throw new NotFoundException('존재하지 않는 사용자입니다');
      }
      return user;
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async getUsersInfo() {
    try {
      const allUsers = this.usersRepository.find({});
      return allUsers;
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  private async checkNicknameExists(name: string, currentUserId: number) {
    const user = await this.usersRepository.findOne({ where: { name } });
    if (user && currentUserId !== user.userId) {
      // 동일한 닉네임 유저가 이미 있으며, 그 유저가 본인이 아닐 경우에
      throw new ConflictException('이미 있는 닉네임입니다');
    } else {
      return;
    }
  }
}
