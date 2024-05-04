import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
// import { Strategy } from 'passport-apple';
import { Strategy } from '@arendajaelu/nestjs-passport-apple';

@Injectable()
export class AppleStrategy extends PassportStrategy(Strategy, 'apple') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get('OAUTH_APPLE_ID'),
      teamID: configService.get('OAUTH_APPLE_TEAM'),
      callbackURL: configService.get('OAUTH_APPLE_REDIRECT'),
      keyID: configService.get('OAUTH_APPLE_KEY'),
      privateKeyString: `-----BEGIN PRIVATE KEY-----
      MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQglDM9riRHfhJYX8Vp
      L84DXtXLCgdlun7pUdWsQFbl8TugCgYIKoZIzj0DAQehRANCAAToEvYfFm/QUuRP
      5OnBiqPZ8lv4iH8llNSLSeRwyp6dCZ5MOV4+hKL9HUCTgcXnqxPyhUQCP4tSuqUj
      zFPaBBw5
      -----END PRIVATE KEY-----`,
      passReqToCallback: true,
    });
  }

  async function(req, accessToken, refreshToken, idToken, profile, cb) {
    try {
      console.log('req:', req);
      console.log('accessToken:', accessToken);
      console.log('refreshToken:', refreshToken);
      console.log('idToken:', idToken);
      console.log('profile:', profile);
      cb(null, idToken);
    } catch (e) {
      console.error(e);
    }
  }
}
