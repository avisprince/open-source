import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import { GqlUserStrategy } from '#src/auth/strategies/gqlUser.strategy';
import { User } from '#src/mongo/models';
import Ctx from '#src/types/graphql.context.type';
import { UserGuard } from '#src/users/user.guard';
import { UserService } from '#src/users/user.service';

export const returnUser = () => User;

@UseGuards(GqlUserStrategy)
@Resolver(returnUser)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(returnUser)
  public async currentUser(@Context() { req }: Ctx): Promise<User> {
    return req.user;
  }

  @UseGuards(UserGuard)
  @Mutation(() => User)
  public changeName(
    @Args('email') email: string,
    @Args('newName') newName: string,
  ): Promise<User> {
    return this.userService.changeName(email, newName);
  }

  @UseGuards(UserGuard)
  @Mutation(() => Boolean)
  public changePassword(
    @Args('email') email: string,
    @Args('newPassword') newPassword: string,
  ): Promise<boolean> {
    return this.userService.changePassword(email, newPassword);
  }
}
