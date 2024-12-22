import { Module } from '@nestjs/common';

import { AuthController } from '#src/auth/auth.controller';
import { AuthService } from '#src/auth/auth.service';
import { CreateOperationGuard } from '#src/auth/authorization/create.guard';
import { DeleteOperationGuard } from '#src/auth/authorization/delete.guard';
import { ReadOperationGuard } from '#src/auth/authorization/read.guard';
import { UpdateOperationGuard } from '#src/auth/authorization/update.guard';
import { Auth0Client } from '#src/auth/clients/auth0.client';
import { CognitoClient } from '#src/auth/clients/cognito.client';
import { ApiKeyStrategy } from '#src/auth/strategies/apiKey.strategy';
import { GqlUserStrategy } from '#src/auth/strategies/gqlUser.strategy';
import { LoginStrategy } from '#src/auth/strategies/login.strategy';
import { ServerLoginStrategy } from '#src/auth/strategies/serverLogin.strategy';
import { UserStrategy } from '#src/auth/strategies/user.strategy';
import { LoginValidator } from '#src/auth/validators/login.validator';

@Module({
  providers: [
    AuthService,
    UserStrategy,
    GqlUserStrategy,
    LoginStrategy,
    ServerLoginStrategy,
    ApiKeyStrategy,
    CreateOperationGuard,
    ReadOperationGuard,
    UpdateOperationGuard,
    DeleteOperationGuard,
    Auth0Client,
    CognitoClient,
    LoginValidator,
  ],
  controllers: [AuthController],
  exports: [
    AuthService,
    CreateOperationGuard,
    ReadOperationGuard,
    UpdateOperationGuard,
    DeleteOperationGuard,
  ],
})
export class AuthModule {}
