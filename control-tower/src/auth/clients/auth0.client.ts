import { Injectable } from '@nestjs/common';
import axios from 'axios';

import { User } from '#src/mongo/models';

@Injectable()
export class Auth0Client {
  public async getUserInfo(accessToken: string): Promise<Partial<User>> {
    const userInfo = (
      await axios.get(`https://${process.env.AUTH0_DOMAIN}/oauth2/userInfo`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
    ).data;

    return {
      name: userInfo.name,
      email: userInfo.email,
      emailVerified: userInfo.email_verified,
      picture: userInfo.picture,
    };
  }
}
