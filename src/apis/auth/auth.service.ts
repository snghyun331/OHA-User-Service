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
import { GoogleUser, KakaoUser, NaverUser } from './interfaces';
import { TokenService } from './token.service';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

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

  async handleSocialLogin(socialUser: GoogleUser | KakaoUser | NaverUser, transactionManager: EntityManager) {
    try {
      let type: string;
      let result: any;
      let isNameExist: boolean;
      const { providerId } = socialUser;
      const providerType = await this.getProviderType(socialUser);
      const user = await this.usersRepository.findOne({ where: { providerType, providerId } });

      if (!user) {
        const newUser = await this.createUser(providerType, socialUser, transactionManager);
        result = await this.login(newUser, transactionManager);
        const { accessToken } = result;
        await this.createDefaultDistrict(accessToken, newUser);
        type = 'new';
        isNameExist = false;
      } else {
        result = await this.login(user, transactionManager);
        if (user.name === null) {
          isNameExist = false;
        } else {
          isNameExist = true;
        }
        type = 'exist';
      }
      return { type, isNameExist, ...result };
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
      await transactionManager.update(UserEntity, userId, { hashedRF: null });
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

  private async createUser(providerType, user, transactionManager) {
    const { providerId, email } = user;
    const newUser = new UserEntity();
    newUser.providerType = providerType;
    newUser.providerId = providerId;
    newUser.email = email;

    const result = await transactionManager.save(newUser);
    return result;
  }

  async getCookieWithAccessToken(userId: number, providerId: string) {
    const result = await this.tokenService.generateCookieWithAccessToken(userId, providerId);
    return result;
  }

  private async getProviderType(user: GoogleUser | KakaoUser | NaverUser) {
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
    const address = '서울특별시 강남구 논현동';
    const headers = { Authorization: `Bearer ${accessToken}` };
    const body = { address: address };

    let apiUrl;
    if (process.env.NODE_ENV === 'dev') {
      apiUrl = `http://${process.env.HOST}:3010/api/common/location/freqdistrict`;
    } else {
      apiUrl = `http://${process.env.Eureka_HOST}/api/common/location/freqdistrict`;
    }
    return await lastValueFrom(this.httpService.post(apiUrl, body, { headers }));
  }
}
