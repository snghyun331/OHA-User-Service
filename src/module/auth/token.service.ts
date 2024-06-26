import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interface';
import { SALT_ROUND } from 'src/utils/constant';
import * as bcrypt from 'bcryptjs';
import * as CryptoJS from 'crypto-js';
import { UserGradeEnum } from 'src/common/enum/enum';

@Injectable()
export class TokenService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async generateCookieWithAccessToken(userId: number, providerId: string, userGrade: UserGradeEnum) {
    const payload: JwtPayload = { userId, providerId, userGrade };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET_KEY'),
      expiresIn: this.configService.get('JWT_ACCESS_EXPIRATION_TIME'),
    });
    const result = {
      accessToken: token,
      httpOnly: true,
    };
    return result;
  }

  async generateCookieWithRefreshToken(userId: number, providerId: string, userGrade: UserGradeEnum) {
    const payload: JwtPayload = { userId, providerId, userGrade };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET_KEY'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION_TIME'),
    });

    const result = {
      refreshToken: token,
      path: 'api/auth',
      httpOnly: true,
    };
    return result;
  }

  async hashRefreshToken(refreshToken: string) {
    const hashedRf = await bcrypt.hash(refreshToken, SALT_ROUND);
    return hashedRf;
  }

  async isRefreshTokenMatch(refreshToken: string, hashedRF: string) {
    const result = await bcrypt.compare(refreshToken, hashedRF);
    return result;
  }

  async removeCookiesForLogout() {
    return {
      refreshOption: {
        path: 'api/auth',
        httpOnly: true,
        maxAge: 0,
      },
    };
  }

  async encryptFCMToken(fcmToken: string) {
    const encryptedFCM = await CryptoJS.AES.encrypt(fcmToken, this.configService.get('ENCRYPT_SECRET_KEY')).toString();
    return encryptedFCM;
  }

  async decrypt(encryptedFCM: string) {
    const bytes = CryptoJS.AES.decrypt(encryptedFCM, this.configService.get('ENCRYPT_SECRET_KEY'));
    return bytes.toString(CryptoJS.enc.Utf8);
  }
}
