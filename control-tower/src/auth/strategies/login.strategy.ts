import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-auth0';

import { AuthStrategies } from '#src/auth/auth.constants';
import { LoginValidator } from '#src/auth/validators/login.validator';

@Injectable()
export class LoginStrategy extends PassportStrategy(
  Strategy,
  AuthStrategies.LOGIN,
) {
  constructor(private readonly loginValidator: LoginValidator) {
    super({
      clientID: process.env.AUTH0_CLIENT_ID,
      clientSecret: process.env.AUTH0_CLIENT_SECRET,
      callbackURL: `${process.env.AUTH_CALLBACK_DOMAIN}/auth/callback`,
      domain: process.env.AUTH0_DOMAIN,
      scopeSeparator: 'openid profile email',
      state: false,
    });
  }

  validate(accessToken: string): Promise<string> {
    return this.loginValidator.validate(accessToken);
  }
}
