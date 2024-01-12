import { Inject, Injectable, Logger, LoggerService, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { OAuthType } from 'src/users/types/user.enum';

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

  async googleRegisterOrLogin(googleUser) {
    try {
      const { providerId, email, name } = googleUser;
      const user = await this.usersRepository.findOne({ where: { googleProviderId: providerId } });
      if (!user) {
        // 새로운 회원 가입&로그인
        const newUser = await this.createGoogleUser(providerId, email, name);
        const user = await this.usersRepository.save(newUser);
        const result = await this.googleLogin(user);
        const type = 'new';
        return { type: type, ...result };
      } else {
        // 기존 회원 로그인
        const result = await this.googleLogin(user);
        const type = 'exist';
        return { type: type, ...result };
      }
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async getUserIfRefreshTokenMatches(refreshToken: string, userId: number) {
    try {
      const user = await this.usersRepository.findOne({ where: { userId } });
      if (!user || !user.hashedRF) {
        throw new UnauthorizedException('Access Denied');
      }
      const isRefreshTokenMatching = await bcrypt.compare(refreshToken, user.hashedRF);
      if (isRefreshTokenMatching) {
        return user;
      } else {
        throw new UnauthorizedException('Refresh 토큰이 사용자 것과 일치하지 않습니다');
      }
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  private async getCookieWithAccessToken(userId: number, googleProviderId: string) {
    try {
      const user = this.usersRepository.findOne({ where: { userId } });
      if (!user) {
        throw new ForbiddenException('접근 권한이 없습니다.');
      }
      const payload = { userId, googleProviderId };
      const token = this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_SECRET_KEY'),
        expiresIn: +this.configService.get('JWT_ACCESS_EXPIRATION_TIME'),
      });
      const result = {
        accessToken: token,
        domain: this.configService.get('DB_HOST'),
        path: '/',
        httpOnly: true,
        maxAge: +this.configService.get('JWT_ACCESS_EXPIRATION_TIME') * 1000,
      };
      return result;
    } catch (e) {
      this.logger.error(e);
      if (e instanceof ForbiddenException) throw e;
    }
  }

  private async getCookieWithRefreshToken(userId: number, googleProviderId: string) {
    try {
      const user = this.usersRepository.findOne({ where: { userId } });
      if (!user) {
        throw new ForbiddenException('접근 권한이 없습니다.');
      }
      const payload = { userId, googleProviderId };
      const token = this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET_KEY'),
        expiresIn: +this.configService.get('JWT_REFRESH_EXPIRATION_TIME'),
      });

      const result = {
        refreshToken: token,
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        maxAge: +this.configService.get('JWT_REFRESH_EXPIRATION_TIME') * 1000,
      };
      return result;
    } catch (e) {
      this.logger.error(e);
      if (e instanceof ForbiddenException) throw e;
    }
  }

  private async hashAndSaveRF(refreshToken: string, userId: number) {
    const hashedRF = await bcrypt.hash(refreshToken, 10);
    await this.usersRepository.update(userId, { hashedRF });
    return;
  }

  private async googleLogin(user) {
    const [accessTokenResult, refreshTokenResult] = await Promise.all([
      this.getCookieWithAccessToken(user.userId, user.googleProviderId),
      this.getCookieWithRefreshToken(user.userId, user.googleProviderId),
    ]);

    const { accessToken, ...accessOption } = accessTokenResult;
    const { refreshToken, ...refreshOption } = refreshTokenResult;

    await this.hashAndSaveRF(refreshToken, user.userId);
    const result = { accessToken, accessOption, refreshToken, refreshOption };
    return result;
  }

  private async createGoogleUser(providerId, email, name) {
    const newUser = new UserEntity();
    newUser.oauthType = OAuthType.google;
    newUser.googleProviderId = providerId;
    newUser.email = email;
    newUser.name = name;
    return newUser;
  }
}
