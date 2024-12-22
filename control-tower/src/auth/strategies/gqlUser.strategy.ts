import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';

import { AuthStrategies } from '#src/auth/auth.constants';

@Injectable()
export class GqlUserStrategy extends AuthGuard(AuthStrategies.USER) {
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    const gqlReq = ctx.getContext().req;

    if (gqlReq) {
      gqlReq.body = ctx.getArgs().variables;
      return gqlReq;
    }

    return context.switchToHttp().getRequest();
  }
}
