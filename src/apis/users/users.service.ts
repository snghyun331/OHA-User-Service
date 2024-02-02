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
import { CreateFreqDto } from './dto/create-freq.dto';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { UserFreqDistrictEntity } from './entities/user-freq-locations.entity';

@Injectable()
export class UsersService {
  constructor(
    @Inject(Logger)
    private readonly logger: LoggerService,
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    @InjectRepository(UserFreqDistrictEntity)
    private userFreqDistrictRepository: Repository<UserFreqDistrictEntity>,
    private configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async updateNickname(userId: number, updateNameDto: UpdateNameDto, transactionManager: EntityManager) {
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

  async getSpecificUsersInfo(usersInfoDto: UsersInfoDto, manager: EntityManager) {
    try {
      const { userIds } = usersInfoDto;
      if (!userIds || userIds.length === 0) {
        throw new BadRequestException('요청한 유저 아이디가 없습니다');
      }
      const users = await manager.getRepository(UserEntity).find({
        where: { userId: In(userIds) },
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

  async createFreqDistrict(token: string, userId: number, createFreqDto: CreateFreqDto, transactionManager) {
    try {
      const { address } = createFreqDto;
      const code = await this.findCode(token, address);
      const freqInfo = await this.userFreqDistrictRepository.findOne({ where: { userId, code } });
      if (freqInfo) {
        throw new ConflictException('해당 지역을 이미 선택했습니다');
      }
      await this.createFreqDistrictOfUser(code, userId, transactionManager);
      const allFreqDistricts = await this.getUserFreqDistricts(token, userId, transactionManager);
      return allFreqDistricts;
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async getUserFreqDistricts(token: string, userId: number, transactionManager) {
    const results = await transactionManager.find(UserFreqDistrictEntity, {
      select: { code: true },
      where: { userId },
    });
    const codes = results.map((result) => result.code);
    const accessToken = token;
    const headers = { Authorization: `Bearer ${accessToken}` };
    const body = { codes: codes };
    const response = await lastValueFrom(
      // toPromise()역할과 비슷
      this.httpService.post('http://52.79.158.1/api/common/location/getnamebycodes', body, {
        headers,
      }),
    );
    const districtNames = response.data.data;
    const result = districtNames.reduce((acc, item) => {
      const { firstAddress, secondAddress, thirdAddress } = item;

      // 1단계: 주소 정보 가져오기
      const firstLevel = acc[firstAddress] || {};
      const secondLevel = firstLevel[secondAddress] || [];

      // 2단계: 주소 정보 추가
      if (thirdAddress && !secondLevel.includes(thirdAddress)) {
        secondLevel.push(thirdAddress);
      }

      // 결과 데이터 갱신
      firstLevel[secondAddress] = secondLevel;
      acc[firstAddress] = firstLevel;

      return acc;
    }, {});
    return result;
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

  private async findCode(token: string, address: string) {
    const accessToken = token;
    const headers = { Authorization: `Bearer ${accessToken}` };
    const body = { address: address };
    const response = await lastValueFrom(
      // toPromise()역할과 비슷
      this.httpService.post('http://52.79.158.1/api/common/location/getcode', body, {
        headers,
      }),
    );
    const code = response.data.data.code;
    return code;
  }

  private async createFreqDistrictOfUser(code: string, userId: number, transactionManager) {
    const newFreqDistrict = new UserFreqDistrictEntity();
    newFreqDistrict.code = code;
    newFreqDistrict.userId = userId;

    await transactionManager.save(newFreqDistrict);
    console.log('*');
    return;
  }
}
