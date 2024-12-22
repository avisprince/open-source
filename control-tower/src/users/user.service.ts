import { Injectable, Logger } from '@nestjs/common';
import axios, { Method } from 'axios';
import { get } from 'lodash';

import { AuthService } from '#src/auth/auth.service';
import { User } from '#src/mongo/models/user.model';
import { UsersRepository } from '#src/mongo/repositories';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(
    private readonly authService: AuthService,
    private readonly usersRepository: UsersRepository,
  ) {}

  public changeName(email: string, name: string): Promise<User> {
    return this.usersRepository.update(email, { name });
  }

  public async changePassword(userEmail: string, newPassword: string) {
    // get access token:
    const auth0AccessToken =
      await this.authService.getManagementApiAccessToken();
    if (!auth0AccessToken) {
      this.logger.error(
        `Change password route failed to get Auth0 management access token`,
      );
      return false;
    }

    // lookup auth0 userId from email:
    const userLookup = {
      method: 'GET' as Method,
      url: `https://${process.env.AUTH0_DOMAIN}/api/v2/users-by-email?email=${userEmail}`,
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${auth0AccessToken}`,
      },
    };

    const userLookupResponse = await axios.request(userLookup).catch(error => {
      this.logger.error(
        `Change password route failed to find Auth0 user id. Error response:`,
      );
      this.logger.error(error);
      return {};
    });

    const userId = get(userLookupResponse, ['data', 0, 'user_id']);
    if (!userId) {
      return false;
    }

    // submit change password with auth0 userId
    const changePassword = {
      method: 'PATCH' as Method,
      url: `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${userId}`,
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${auth0AccessToken}`,
      },
      data: { password: newPassword },
    };

    const changePasswordResponse = await axios
      .request(changePassword)
      .catch(error => {
        const message = get(error, ['response', 'data', 'message']);
        this.logger.error(message || error);
        return 'Password change failed';
      });

    return changePasswordResponse !== 'Password change failed';
  }
}
