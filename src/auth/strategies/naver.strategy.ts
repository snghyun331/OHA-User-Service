import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-naver-v2';

@Injectable()
export class NaverStrategy extends PassportStrategy(Strategy, 'naver') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get('OAUTH_NAVER_ID'),
      clientSecret: configService.get('OAUTH_NAVER_SECRET'),
      callbackURL: configService.get('OAUTH_NAVER_REDIRECT'),
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    const { id, nickname, email } = profile;
    return {
      provider: 'naver',
      providerId: id,
      name: nickname,
      email: email,
    };
  }
}
