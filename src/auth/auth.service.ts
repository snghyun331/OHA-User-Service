import { Inject, Injectable, Logger, LoggerService, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/users/entities/user.entity';
import { EntityManager, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { ProviderType } from 'src/users/types/user.enum';
import { SALT_ROUND } from 'src/utils/constant';

@Injectable()
export class AuthService {
  constructor(
    @Inject(Logger)
    private readonly logger: LoggerService,
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async googleRegisterOrLogin(googleUser, transactionManager: EntityManager) {
    try {
      let type;
      let result;
      const { providerId } = googleUser;
      const user = await this.usersRepository.findOne({ where: { providerType: ProviderType.google, providerId } });
      if (!user) {
        // 새로운 회원 가입&로그인
        const newUser = await this.createGoogleUser(googleUser, transactionManager);
        result = await this.googleLogin(newUser, transactionManager);
        type = 'new';
      } else {
        // 기존 회원 로그인
        result = await this.googleLogin(user, transactionManager);
        type = 'exist';
      }
      return { type: type, ...result };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async kakaoRegisterOrLogin(kakaoUser, transactionManager: EntityManager) {
    try {
      let type;
      let result;
      const { providerId } = kakaoUser;
      const user = await this.usersRepository.findOne({ where: { providerType: ProviderType.kakao, providerId } });
      if (!user) {
        // 새로운 회원 가입&로그인
        const newUser = await this.createKakaoUser(kakaoUser, transactionManager);
        result = await this.kakaoLogin(newUser, transactionManager);
        type = 'new';
      } else {
        // 기존 회원 로그인
        result = await this.kakaoLogin(user, transactionManager);
        type = 'exist';
      }
      return { type: type, ...result };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async naverRegiserOrLogin(naverUser, transactionManager: EntityManager) {
    try {
      let type;
      let result;
      const { providerId } = naverUser;
      const user = await this.usersRepository.findOne({ where: { providerType: ProviderType.naver, providerId } });
      if (!user) {
        // 새로운 회원 가입&로그인
        const newUser = await this.createNaverUser(naverUser, transactionManager);
        result = await this.naverLogin(newUser, transactionManager);
        type = 'new';
      } else {
        // 기존 회원 로그인
        result = await this.naverLogin(user, transactionManager);
        type = 'exist';
      }
      return { type: type, ...result };
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
      const isRefreshTokenMatching = await bcrypt.compare(refreshToken, user.hashedRF);
      if (isRefreshTokenMatching) {
        return;
      } else {
        throw new UnauthorizedException('Refresh 토큰이 사용자 것과 일치하지 않습니다');
      }
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async getCookieWithAccessToken(userId: number, providerId: string) {
    try {
      const user = this.usersRepository.findOne({ where: { userId } });
      if (!user) {
        throw new ForbiddenException('접근 권한이 없습니다.');
      }
      const payload = { userId, providerId };
      const token = this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_SECRET_KEY'),
        expiresIn: +this.configService.get('JWT_ACCESS_EXPIRATION_TIME'),
      });
      const result = {
        accessToken: token,
        domain: this.configService.get('HOST'),
        path: '/',
        httpOnly: true,
        maxAge: +this.configService.get('JWT_ACCESS_EXPIRATION_TIME'),
      };
      return result;
    } catch (e) {
      this.logger.error(e);
      if (e instanceof ForbiddenException) throw e;
    }
  }

  async getCookieWithRefreshToken(userId: number, providerId: string) {
    try {
      const user = this.usersRepository.findOne({ where: { userId } });
      if (!user) {
        throw new ForbiddenException('접근 권한이 없습니다.');
      }
      const payload = { userId, providerId };
      const token = this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET_KEY'),
        expiresIn: +this.configService.get('JWT_REFRESH_EXPIRATION_TIME'),
      });

      const result = {
        refreshToken: token,
        domain: this.configService.get('HOST'),
        path: '/',
        httpOnly: true,
        maxAge: +this.configService.get('JWT_REFRESH_EXPIRATION_TIME'),
      };
      return result;
    } catch (e) {
      this.logger.error(e);
      if (e instanceof ForbiddenException) throw e;
    }
  }

  private async googleLogin(user, transactionManager) {
    const [accessTokenResult, refreshTokenResult] = await Promise.all([
      this.getCookieWithAccessToken(user.userId, user.providerId),
      this.getCookieWithRefreshToken(user.userId, user.providerId),
    ]);
    const { accessToken, ...accessOption } = accessTokenResult;
    const { refreshToken, ...refreshOption } = refreshTokenResult;
    const hashedRF = await bcrypt.hash(refreshToken, SALT_ROUND);
    await transactionManager.update(UserEntity, user.userId, { hashedRF });
    const result = { accessToken, accessOption, refreshToken, refreshOption };
    return result;
  }

  private async kakaoLogin(user, transactionManager) {
    const [accessTokenResult, refreshTokenResult] = await Promise.all([
      this.getCookieWithAccessToken(user.userId, user.providerId),
      this.getCookieWithRefreshToken(user.userId, user.providerId),
    ]);
    const { accessToken, ...accessOption } = accessTokenResult;
    const { refreshToken, ...refreshOption } = refreshTokenResult;
    const hashedRF = await bcrypt.hash(refreshToken, SALT_ROUND);
    await transactionManager.update(UserEntity, user.userId, { hashedRF });
    const result = { accessToken, accessOption, refreshToken, refreshOption };
    return result;
  }

  private async naverLogin(user, transactionManager) {
    const [accessTokenResult, refreshTokenResult] = await Promise.all([
      this.getCookieWithAccessToken(user.userId, user.providerId),
      this.getCookieWithRefreshToken(user.userId, user.providerId),
    ]);
    const { accessToken, ...accessOption } = accessTokenResult;
    const { refreshToken, ...refreshOption } = refreshTokenResult;
    const hashedRF = await bcrypt.hash(refreshToken, SALT_ROUND);
    await transactionManager.update(UserEntity, user.userId, { hashedRF });
    const result = { accessToken, accessOption, refreshToken, refreshOption };
    return result;
  }

  async createGoogleUser(googleUser, transactionManager) {
    const { providerId, email } = googleUser;
    const newUser = new UserEntity();
    newUser.providerType = ProviderType.google;
    newUser.providerId = providerId;
    newUser.email = email;
    newUser.name = email.substring(0, email.indexOf('@'));
    const user = await transactionManager.save(newUser);
    return user;
  }

  async createKakaoUser(kakaoUser, transactionManager) {
    const { providerId, email } = kakaoUser;
    const newUser = new UserEntity();
    newUser.providerType = ProviderType.kakao;
    newUser.providerId = providerId;
    newUser.name = email.substring(0, email.indexOf('@'));
    newUser.email = email;
    const user = await transactionManager.save(newUser);
    return user;
  }

  async createNaverUser(naverUser, transactionManager) {
    const { providerId, email } = naverUser;
    const newUser = new UserEntity();
    newUser.providerType = ProviderType.naver;
    newUser.providerId = providerId;
    newUser.name = email.substring(0, email.indexOf('@'));
    newUser.email = email;
    const user = await transactionManager.save(newUser);
    return user;
  }
}
