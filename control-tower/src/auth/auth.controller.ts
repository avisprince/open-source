import { Controller, Get, Query, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AuthStrategies } from '#src/auth/auth.constants';

@Controller('auth')
export class AuthController {
  @Get('login')
  public login(@Res() res) {
    const { AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH_CALLBACK_DOMAIN } = process.env;
    const redirectUri = `${AUTH_CALLBACK_DOMAIN}/auth/callback`;

    return res.redirect(
      302,
      `https://${AUTH0_DOMAIN}/authorize?response_type=code&client_id=${AUTH0_CLIENT_ID}&redirect_uri=${redirectUri}&scope=openid profile email`,
    );
  }

  @UseGuards(AuthGuard(AuthStrategies.LOGIN))
  @Get('callback')
  public authCallback(@Req() req, @Res() res) {
    return res.redirect(
      `${process.env.DASHBOARD_URI}/login/callback?accessToken=${req.user}`,
    );
  }

  @Get('server/login')
  public serverLogin(@Res() res) {
    const { AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH_CALLBACK_DOMAIN } = process.env;
    const redirectUri = `${AUTH_CALLBACK_DOMAIN}/auth/server/callback`;

    return res.redirect(
      302,
      `https://${AUTH0_DOMAIN}/oauth2/authorize?response_type=code&client_id=${AUTH0_CLIENT_ID}&redirect_uri=${redirectUri}&scope=openid profile email`,
    );
  }

  @UseGuards(AuthGuard(AuthStrategies.SERVER_LOGIN))
  @Get('server/callback')
  public serverAuthCallback(@Req() req, @Res() res) {
    // Need to redirect off of oauth url back to Dokkimi
    return res.redirect(`/auth/accessToken?accessToken=${req.user}`);
  }

  @Get('accessToken')
  public accessToken(@Query('accessToken') accessToken) {
    return accessToken;
  }
}
