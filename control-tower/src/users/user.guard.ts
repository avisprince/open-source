import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common/enums';
import { HttpException } from '@nestjs/common/exceptions';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class UserGuard implements CanActivate {
  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const graphQLcontext = GqlExecutionContext.create(context);
    const request = graphQLcontext.getContext().req;
    const args = graphQLcontext.getArgs();

    const isAuthorized = request.user.email === args.email; // user can only change their own password
    if (!isAuthorized) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    return true;
  }
}
