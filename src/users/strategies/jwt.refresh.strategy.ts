import { BadRequestException, Inject, Injectable, Logger, LoggerService } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor(
    @Inject(Logger) private readonly logger: LoggerService,
    private configService: ConfigService,
    private userService: UsersService,
  ) {
    super();
  }

  async validate(req: Request) {
    try {
      const refreshToken = req.headers['authorization']?.slice(7);
      if (!refreshToken) {
        throw new BadRequestException('There is no refresh token in header');
      }
      const secretKey = this.configService.get<string>('JWT_REFRESH_SECRET_KEY');
      const payload = jwt.verify(refreshToken, secretKey);
      const userId = payload['userId'];
      return this.userService.getUserIfRefreshTokenMatches(refreshToken, userId);
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
}
