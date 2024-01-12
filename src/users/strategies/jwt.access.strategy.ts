import { BadRequestException, Injectable, Logger, LoggerService, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'access') {
  constructor(
    @Inject(Logger)
    private readonly logger: LoggerService,
    private configService: ConfigService,
  ) {
    super();
  }

  async validate(req: Request) {
    try {
      const userToken = req.headers['authorization']?.slice(7);

      if (!userToken) {
        throw new BadRequestException('There is no access token in header');
      }
      const secretKey = this.configService.get<string>('JWT_SECRET_KEY');
      const payload = jwt.verify(userToken, secretKey); // payload에는 userId만
      const userId = payload['userId'];
      return userId;
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
}
