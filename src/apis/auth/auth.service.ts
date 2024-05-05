import {
  Inject,
  Injectable,
  Logger,
  LoggerService,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
  HttpStatus,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../users/entities/user.entity';
import { EntityManager, Repository } from 'typeorm';
import { ProviderType } from '../users/types/user.enum';
import { GoogleUser, KakaoUser, NaverUser, AppleUser } from './interfaces';
import { TokenService } from './token.service';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { UserDto } from './dto/user.dto';
import { FCMDto } from './dto/fcm.dto';
import * as moment from 'moment-timezone';

@Injectable()
export class AuthService {
  constructor(
    @Inject(Logger)
    private readonly logger: LoggerService,
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    private tokenService: TokenService,
    private readonly httpService: HttpService,
  ) {}

  async handleSocialLogin(
    socialUser: GoogleUser | KakaoUser | NaverUser | AppleUser,
    transactionManager: EntityManager,
  ) {
    try {
      let result: any;
      let isNameExist: boolean;
      let userInfo: object;
      const { providerId } = socialUser;
      const providerType = await this.getProviderType(socialUser);
      const user = await this.usersRepository.findOne({ where: { providerType, providerId } });

      if (!user) {
        // 새로 가입할 회원일 경우
        const result = await this.newUserLogin(socialUser, transactionManager);
        return result;
      } else {
        // 기존 회원일 경우
        result = await this.login(user, transactionManager);
        if (user.name === null) {
          isNameExist = false;
        } else {
          isNameExist = true;
        }
        userInfo = {
          providerType: user.providerType,
          email: user.email,
          name: user.name,
          profileUrl: user.profileUrl,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        };
      }
      return { isJoined: user.isJoined, isNameExist, ...result, userInfo };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async newUserLogin(socialUser: UserDto, transactionManager: EntityManager) {
    try {
      const providerType = await this.getProviderType(socialUser);
      const { providerId } = socialUser;
      const user = await this.usersRepository.findOne({ where: { providerType, providerId } });
      if (user) {
        throw new ConflictException('해당 유저는 이미 가입되어있습니다');
      }
      const newUser = await this.createUnJoinedUser(providerType, socialUser, transactionManager);
      const result = await this.login(newUser, transactionManager);
      const { accessToken } = result;
      await this.createDefaultDistrict(accessToken, newUser);
      const isNameExist = false;
      const userInfo = {
        providerType: newUser.providerType,
        email: newUser.email,
        name: newUser.name,
        profileUrl: newUser.profileUrl,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
      };
      return { isJoined: newUser.isJoined, isNameExist, ...result, userInfo };
    } catch (e) {
      this.logger.error(e);
      if (e.response && e.response.data) {
        if (e.response.data.statusCode === HttpStatus.BAD_REQUEST) {
          throw new ConflictException(`${e.response.data.message}`);
        }
        if (e.response.data.statusCode === HttpStatus.NOT_FOUND) {
          throw new NotFoundException(`${e.response.data.message}`);
        }
      }
      throw e;
    }
  }

  async socialLogout(userId: number, transactionManager: EntityManager) {
    try {
      await transactionManager.update(UserEntity, userId, { hashedRF: null, encryptedFCM: null, FCMTimestamp: null });
      const result = await this.tokenService.removeCookiesForLogout();
      return result;
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async deleteUserAndLogout(userId: number, providerId: string, transactionManager: EntityManager) {
    try {
      const user = this.usersRepository.findOne({ where: { userId, providerId } });
      if (!user) {
        throw new NotFoundException('존재하지 않는 사용자입니다');
      }
      const result = await this.tokenService.removeCookiesForLogout();
      await transactionManager.delete(UserEntity, userId);
      return result;
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async checkIfRefreshTokenMatches(refreshToken: string, userId: number) {
    try {
      const user = await this.usersRepository.findOne({ where: { userId } });
      if (!user || !user.hashedRF) {
        throw new UnauthorizedException('Access Denied');
      }
      const isMatch = await this.tokenService.isRefreshTokenMatch(refreshToken, user.hashedRF);
      if (isMatch) {
        return;
      } else {
        throw new UnauthorizedException('Refresh 토큰이 사용자 것과 일치하지 않습니다');
      }
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  private async login(socialUser, transactionManager) {
    const userId = socialUser.userId;
    const providerId = socialUser.providerId;
    const user = this.usersRepository.findOne({ where: { userId } });
    if (!user) {
      throw new ForbiddenException('접근 권한이 없습니다.');
    }
    const [accessTokenResult, refreshTokenResult] = await Promise.all([
      this.tokenService.generateCookieWithAccessToken(userId, providerId),
      this.tokenService.generateCookieWithRefreshToken(userId, providerId),
    ]);
    const { accessToken, ...accessOption } = accessTokenResult;
    const { refreshToken, ...refreshOption } = refreshTokenResult;
    const hashedRF = await this.tokenService.hashRefreshToken(refreshToken);
    await transactionManager.update(UserEntity, userId, { hashedRF });
    const result = { accessToken, accessOption, refreshToken, refreshOption };
    return result;
  }

  async getCookieWithAccessToken(userId: number, providerId: string) {
    const result = await this.tokenService.generateCookieWithAccessToken(userId, providerId);
    return result;
  }

  async createFCM(userId: number, dto: FCMDto, transactionManager: EntityManager) {
    try {
      const { fcmToken } = dto;
      const encryptedFCM = await this.tokenService.encryptFCMToken(fcmToken);
      const FCMTimestamp = moment().tz('Asia/Seoul');
      await transactionManager.update(UserEntity, userId, { encryptedFCM, FCMTimestamp });
      // const test = await transactionManager.findOne(UserEntity, { where: { userId } });
      // const nineHoursInMillis = 9 * 60 * 60 * 1000;
      // console.log(new Date(test.FCMTimestamp.getTime() + nineHoursInMillis));
      return;
    } catch (e) {
      this.logger.error(e);
    }
  }

  private async getProviderType(user: GoogleUser | KakaoUser | NaverUser | AppleUser) {
    const { provider } = user;
    if (provider == 'google') {
      return ProviderType.google;
    } else if (provider == 'kakao') {
      return ProviderType.kakao;
    } else if (provider == 'naver') {
      return ProviderType.naver;
    } else {
      return ProviderType.apple;
    }
  }

  private async createDefaultDistrict(token: string, newUser) {
    const { userId } = newUser;
    if (!userId) {
      throw new BadRequestException('userId가 생성되지 않았습니다');
    }
    const accessToken = token;
    const code = '1168010800';
    const headers = { Authorization: `Bearer ${accessToken}` };
    const body = { code: code };

    let apiUrl;
    if (process.env.NODE_ENV === 'dev') {
      apiUrl = `http://${process.env.HOST}:3010/api/common/location/freqdistrict`;
    } else {
      apiUrl = `http://${process.env.Eureka_HOST}/api/common/location/freqdistrict`;
    }
    return await lastValueFrom(this.httpService.post(apiUrl, body, { headers }));
  }

  private async createUnJoinedUser(providerType, user, transactionManager) {
    const { providerId, email } = user;
    const newUser = new UserEntity();
    newUser.providerType = providerType;
    newUser.providerId = providerId;
    newUser.email = email;

    const result = await transactionManager.save(newUser);
    return result;
  }

  async updateJoinStatus(userId, transactionManager: EntityManager) {
    await transactionManager.update(UserEntity, userId, { isJoined: true });
    return;
  }
}
