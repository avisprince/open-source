import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import Strategy from 'passport-headerapikey';

import { AuthStrategies } from '#src/auth/auth.constants';

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(
  Strategy,
  AuthStrategies.API_KEY,
) {
  constructor() {
    super({ header: 'ApiKey', prefix: '' }, false, (apiKey, done) => {
      done(null, process.env.API_KEY === apiKey);
    });
  }
}
