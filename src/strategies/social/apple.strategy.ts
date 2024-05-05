import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
// import { Strategy } from 'passport-apple';
import { Profile, Strategy } from '@arendajaelu/nestjs-passport-apple';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AppleStrategy extends PassportStrategy(Strategy, 'apple') {
  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {
    super({
      clientID: configService.get('OAUTH_APPLE_ID'),
      teamID: configService.get('OAUTH_APPLE_TEAM'),
      callbackURL: configService.get('OAUTH_APPLE_REDIRECT'),
      keyID: configService.get('OAUTH_APPLE_KEY'),
      key: configService
        .get('OAUTH_APPLE_KEY_PW')
        .split(String.raw`\n`)
        .join('\n'),
      passReqToCallback: false,
      scope: ['email', 'name'],
    });
  }

  async validate(accessToken: string, idToken: string, profile: Profile) {
    const providerId = profile.id;
    const provider = profile.provider;
    const email = profile.email;
    const name = profile.name || null;

    return { provider, providerId, name, email };
  }
}
