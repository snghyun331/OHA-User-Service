import { Inject, Injectable, Logger, LoggerService, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/users/entities/user.entity';
import { EntityManager, Repository } from 'typeorm';
import { ProviderType } from 'src/users/types/user.enum';
import { GoogleUser, KakaoUser, NaverUser } from 'src/auth/interfaces';
import { TokenService } from './token.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject(Logger)
    private readonly logger: LoggerService,
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    private tokenService: TokenService,
  ) {}

  async handleSocialLogin(socialUser: GoogleUser | KakaoUser | NaverUser, transactionManager: EntityManager) {
    try {
      let type: string;
      let result: any;
      const { providerId } = socialUser;
      const providerType = await this.getProviderType(socialUser);
      const user = await this.usersRepository.findOne({ where: { providerType, providerId } });

      if (!user) {
        const newUser = await this.createUser(providerType, socialUser, transactionManager);
        result = await this.login(newUser, transactionManager);
        type = 'new';
      } else {
        result = await this.login(user, transactionManager);
        type = 'exist';
      }
      return { type, ...result };
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
    newUser.name = email.substring(0, email.indexOf('@'));
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
}
