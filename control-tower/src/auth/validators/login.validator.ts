import { Injectable } from '@nestjs/common';

import { Auth0Client } from '#src/auth/clients/auth0.client';
import { OrganizationRoles } from '#src/constants/roles.constants';
import { Organization, User } from '#src/mongo/models';
import {
  AuthRepository,
  OrganizationsRepository,
  UsersRepository,
} from '#src/mongo/repositories';

@Injectable()
export class LoginValidator {
  constructor(
    private readonly auth0Client: Auth0Client,
    private readonly authRepository: AuthRepository,
    private readonly usersRepository: UsersRepository,
    private readonly organizationsRepository: OrganizationsRepository,
  ) {}

  public async validate(accessToken: string): Promise<string> {
    const userInfo = await this.auth0Client.getUserInfo(accessToken);
    const user = await this.createUser(userInfo);
    await this.authRepository.create({
      accessToken,
      user: user.id,
    });

    return accessToken;
  }

  private async createUser(user: Partial<User>): Promise<User> {
    const { email } = user;

    const existingUser = await this.usersRepository.findByEmail(email, true);
    if (existingUser) {
      const personalOrg = (existingUser.organizations as Organization[]).find(
        org => org.isPersonal,
      );

      if (!personalOrg) {
        const organization = await this.createUserOrg(existingUser);
        await this.usersRepository.addOrg(email, organization.id);
      }

      return this.usersRepository.update(email, user);
    }

    const newUser = await this.usersRepository.create(user);
    const organization = await this.createUserOrg(newUser);

    return this.usersRepository.addOrg(email, organization.id);
  }

  private createUserOrg(user: User): Promise<Organization> {
    const { id, email, picture } = user;

    return this.organizationsRepository.create({
      name: email,
      members: [
        {
          email,
          role: OrganizationRoles.ADMIN,
          user: id,
        },
      ],
      image: picture,
      paymentPlan: 'free',
      isPersonal: true,
      owner: id,
      creator: id,
    });
  }
}
