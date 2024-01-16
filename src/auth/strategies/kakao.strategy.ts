import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-kakao';

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get('OAUTH_KAKAO_ID'),
      clientSecret: configService.get('OAUTH_KAKAO_SECRET'),
      callbackURL: configService.get('OAUTH_KAKAO_REDIRECT'),
      scope: ['account_email', 'profile_nickname'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    const id = profile._json.id;
    const nickname = profile._json.properties.nickname;
    const email = profile._json.kakao_account.email || null;
    return {
      provider: 'kakao',
      providerId: id.toString(),
      name: nickname,
      email: email,
    };
  }
}
