import { PassportStrategy } from '@nestjs/passport'
import { Strategy, Profile } from 'passport-facebook'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AuthService } from 'src/modules/auth/auth.service'


@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService
  ) {
    super({
      clientID: configService.get<string>('FACEBOOK_CLIENT_ID'),
      clientSecret: configService.get<string>('FACEBOOK_CLIENT_SECRET'),
      callbackURL: configService.get<string>('FACEBOOK_CALLBACK_URL'),
      scope: ['email'],
      profileFields: ['emails', 'name', 'picture']
    })
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    const { name, emails } = profile

    const user = await this.authService.validateOAuthLogin({
      email: emails?.[0]?.value,
      firstName: name?.givenName,
      lastName: name?.familyName,
      provider: 'facebook',
      providerId: profile.id
    })

    return user
  }
}
