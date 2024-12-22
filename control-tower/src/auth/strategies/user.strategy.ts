import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-http-bearer';

import { AuthStrategies } from '#src/auth/auth.constants';
import { User } from '#src/mongo/models';
import { AuthRepository, UsersRepository } from '#src/mongo/repositories';

@Injectable()
export class UserStrategy extends PassportStrategy(
  Strategy,
  AuthStrategies.USER,
) {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly authRepository: AuthRepository,
  ) {
    super();
  }

  async validate(accessToken: string): Promise<User> {
    const auth = await this.authRepository.findByAccessToken(accessToken);

    return this.usersRepository.findByEmail((auth.user as User).email, true);
  }
}
