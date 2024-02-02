import {
  BadRequestException,
  ConflictException,
  HttpStatus,
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
import { FreqDistrictDto } from './dto/freq-disctrict.dto';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { UserFreqDistrictEntity } from './entities/user-freq-locations.entity';
import { GETCODE_PATH, GETNAMEBYCODES_PATH } from 'src/utils/path';

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

  async getUser(userId: number, providerId: string) {
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

  async getUsers() {
    try {
      const allUsers = await this.usersRepository.find({});
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

  async createFreqDistrict(token: string, userId: number, dto: FreqDistrictDto, transactionManager: EntityManager) {
    try {
      const { address } = dto;
      const code = await this.findDistrictCode(token, address);
      const freqInfo = await this.userFreqDistrictRepository.findOne({ where: { userId, code } });
      if (freqInfo) {
        throw new ConflictException('해당 지역을 이미 선택했습니다');
      }
      await this.createNewFreqDistrict(code, userId, transactionManager);
      const allFreqDistricts = await this.getFreqDistricts(token, userId, transactionManager);
      return allFreqDistricts;
    } catch (e) {
      this.logger.error(e);
      if (e.response && e.response.data) {
        if (e.response.data.statusCode === HttpStatus.BAD_REQUEST) {
          throw new BadRequestException(`${e.response.data.message}`);
        }
        if (e.response.data.statusCode === HttpStatus.NOT_FOUND) {
          throw new NotFoundException(`${e.response.data.message}`);
        }
      }
      throw e;
    }
  }

  async deleteFreqDistrict(token: string, userId: number, dto: FreqDistrictDto, transactionManager: EntityManager) {
    try {
      const { address } = dto;
      const code = await this.findDistrictCode(token, address);
      const deleteResult = await transactionManager.delete(UserFreqDistrictEntity, { userId, code });
      if (deleteResult.affected === 0) {
        throw new ConflictException('해당 지역은 이미 삭제되었습니다');
      }
      const allFreqDistricts = await this.getFreqDistricts(token, userId, transactionManager);
      return allFreqDistricts;
    } catch (e) {
      this.logger.error(e);
      if (e.response && e.response.data) {
        if (e.response.data.statusCode === HttpStatus.BAD_REQUEST) {
          throw new BadRequestException(`${e.response.data.message}`);
        }
        if (e.response.data.statusCode === HttpStatus.NOT_FOUND) {
          throw new NotFoundException(`${e.response.data.message}`);
        }
      }
      throw e;
    }
  }

  async getFreqDistricts(token: string, userId: number, transactionManager: EntityManager) {
    try {
      const results = await transactionManager.find(UserFreqDistrictEntity, {
        select: { code: true },
        where: { userId },
      });
      if (!results || results.length === 0) {
        throw new NotFoundException('코드 조회 결과가 없습니다');
      }
      const codes = results.map((result) => result.code);
      const accessToken = token;
      const headers = { Authorization: `Bearer ${accessToken}` };
      const body = { codes: codes };
      const response = await lastValueFrom(
        this.httpService.post(GETNAMEBYCODES_PATH, body, {
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
    } catch (e) {
      this.logger.error(e);
      if (e.response && e.response.data) {
        if (e.response.data.statusCode === HttpStatus.BAD_REQUEST) {
          throw new BadRequestException(`${e.response.data.message}`);
        }
        if (e.response.data.statusCode === HttpStatus.NOT_FOUND) {
          throw new NotFoundException(`${e.response.data.message}`);
        }
      }
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

  private async findDistrictCode(token: string, address: string) {
    const accessToken = token;
    const headers = { Authorization: `Bearer ${accessToken}` };
    const body = { address: address };
    const response = await lastValueFrom(
      this.httpService.post(GETCODE_PATH, body, {
        headers,
      }),
    );
    const code = response.data.data.code;
    return code;
  }

  private async createNewFreqDistrict(code: string, userId: number, transactionManager: EntityManager) {
    const newFreqDistrict = new UserFreqDistrictEntity();
    newFreqDistrict.code = code;
    newFreqDistrict.userId = userId;
    return await transactionManager.save(newFreqDistrict);
  }
}
