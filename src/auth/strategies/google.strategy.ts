import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get('OAUTH_GOOGLE_ID'),
      clientSecret: configService.get('OAUTH_GOOGLE_SECRET'),
      callbackURL: configService.get('OAUTH_GOOGLE_REDIRECT'),
      scope: ['email', 'profile'],
    });
  }

  // ** get google refresh token **
  // authorizationParams(): { [key: string]: string } {
  //   return {
  //     access_type: 'offline',
  //     prompt: 'select_account',
  //   };
  // }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    console.log(profile);
    const { provider, id, name, emails } = profile;
    return {
      provider,
      providerId: id,
      name: name.givenName,
      email: emails[0].value,
    };
  }
}
