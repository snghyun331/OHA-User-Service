import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  LoggerService,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager, In, Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { UpdateNameDto } from './dto/update-name.dto';
import { UsersInfoDto } from './dto/users-info.dto';
import { unlink } from 'fs/promises';
import { UPLOAD_PATH } from 'src/utils/path';

@Injectable()
export class UsersService {
  constructor(
    @Inject(Logger)
    private readonly logger: LoggerService,
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    private configService: ConfigService,
  ) {}

  async updateNickname(userId: number, dto: UpdateNameDto, transactionManager: EntityManager) {
    try {
      const { name } = dto;
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
      if (!filename) {
        throw new BadRequestException('요청한 프로필이 없습니다');
      }
      const user = await this.usersRepository.findOne({ where: { userId } });

      if (!user) {
        throw new NotFoundException('존재하지 않는 사용자입니다');
      }
      const userProfile = user.profileUrl;

      // 기존 프로필 사진이 존재할 경우
      if (userProfile !== null) {
        const userProfileName = userProfile.split('/').pop();
        await unlink(`${UPLOAD_PATH}/${userProfileName}`);
      }

      const url = `http://${this.configService.get('Eureka_HOST')}/files/user/${filename}`;

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

  async getUser(userId: number) {
    try {
      const user = await this.usersRepository.findOne({
        where: { userId },
        select: ['userId', 'providerType', 'name', 'email', 'profileUrl', 'createdAt', 'updatedAt'],
      });
      if (!user) {
        throw new NotFoundException('존재하지 않는 사용자입니다');
      }

      return user;
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async getUsers() {
    try {
      const allUsers = await this.usersRepository.find({
        select: ['userId', 'providerType', 'name', 'email', 'profileUrl', 'createdAt', 'updatedAt'],
      });
      return allUsers;
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async getSpecificUsers(dto: UsersInfoDto, manager: EntityManager) {
    try {
      const { userIds } = dto;
      if (!userIds || userIds.length === 0) {
        throw new BadRequestException('요청한 유저 아이디가 없습니다');
      }
      const users = await manager.getRepository(UserEntity).find({
        where: { userId: In(userIds) },
        select: ['userId', 'providerType', 'name', 'email', 'profileUrl', 'createdAt', 'updatedAt'],
      });

      if (users.length !== userIds.length) {
        for (const userId of userIds) {
          const userExists = users.some((user) => user.userId === userId);
          if (!userExists) {
            throw new NotFoundException(`아이디가 ${userId}인 유저는 존재하지 않습니다`);
          }
        }
      }
      return users;
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async deleteProfile(userId: number, transactionManager: EntityManager) {
    try {
      const user = await this.usersRepository.findOne({ where: { userId } });
      if (!user) {
        throw new NotFoundException('존재하지 않는 사용자입니다.');
      }
      const userProfile = user.profileUrl;
      if (userProfile === null) {
        throw new NotFoundException('프로필이 이미 삭제되었거나 존재하지 않습니다');
      }
      await transactionManager.update(UserEntity, userId, { profileUrl: null });
      const fileName = userProfile.split('/').pop();
      await unlink(`${UPLOAD_PATH}/${fileName}`);
      return;
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
