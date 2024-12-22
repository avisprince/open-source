import { Injectable, Logger } from '@nestjs/common';
import axios, { Method } from 'axios';
import { get } from 'lodash';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  public async getManagementApiAccessToken(): Promise<string> {
    const options = {
      method: 'POST' as Method,
      url: `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      data: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: process.env.AUTH0_MANAGEMENT_API_CLIENT_ID,
        client_secret: process.env.AUTH0_MANAGEMENT_API_CLIENT_SECRET,
        audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`,
      }),
    };

    const response = await axios.request(options).catch(error => {
      this.logger.error(error);
      return '';
    });

    return get(response, ['data', 'access_token']);
  }
}
