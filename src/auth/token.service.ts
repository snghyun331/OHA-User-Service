import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces';
import { SALT_ROUND } from 'src/utils/constant';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class TokenService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async generateCookieWithAccessToken(userId: number, providerId: string) {
    const payload: JwtPayload = { userId, providerId };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET_KEY'),
      expiresIn: +this.configService.get('JWT_ACCESS_EXPIRATION_TIME'),
    });
    const result = {
      accessToken: token,
      httpOnly: true,
    };
    return result;
  }

  async generateCookieWithRefreshToken(userId: number, providerId: string) {
    const payload: JwtPayload = { userId, providerId };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET_KEY'),
      expiresIn: +this.configService.get('JWT_REFRESH_EXPIRATION_TIME'),
    });

    const result = {
      refreshToken: token,
      path: '/api/auth/refresh',
      httpOnly: true,
    };
    return result;
  }

  async hashRefreshToken(refreshToken) {
    const hashedRf = await bcrypt.hash(refreshToken, SALT_ROUND);
    return hashedRf;
  }

  async isRefreshTokenMatch(refreshToken, hashedRF) {
    const result = await bcrypt.compare(refreshToken, hashedRF);
    return result;
  }

  async removeCookiesForLogout() {
    return {
      refreshOption: {
        path: '/api/auth/refresh',
        maxAge: 0,
      },
    };
  }
}
