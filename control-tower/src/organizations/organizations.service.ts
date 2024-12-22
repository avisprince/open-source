import { Injectable } from '@nestjs/common';
import dayjs from 'dayjs';

import { OrganizationRoles } from '#src/constants/roles.constants';
import { Organization, User } from '#src/mongo/models';
import {
  OrganizationsRepository,
  UsersRepository,
} from '#src/mongo/repositories';
import { MongoID } from '#src/types/mongo.types';

@Injectable()
export class OrganizationsService {
  constructor(
    private readonly organizationsRepository: OrganizationsRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  public async getOrganizationById(orgId: MongoID): Promise<Organization> {
    const tenMinutesAgo = dayjs().subtract(10, 'minutes');

    const organization = await this.organizationsRepository.findById(orgId);
    organization.usage = organization.usage.filter(u =>
      dayjs(u.timestamp).isAfter(tenMinutesAgo),
    );

    return organization;
  }

  public updateOrganization(
    orgId: MongoID,
    organization: Partial<Organization>,
  ): Promise<Organization> {
    return this.organizationsRepository.update(orgId, organization);
  }

  public async createOrganization(
    name: string,
    creatorEmail: string,
  ): Promise<Organization> {
    const user = await this.usersRepository.findByEmail(creatorEmail);

    const organization = await this.organizationsRepository.create({
      name,
      members: [
        {
          email: creatorEmail,
          role: OrganizationRoles.ADMIN,
          user: user.id,
        },
      ],
      paymentPlan: 'free',
      isPersonal: false,
      owner: user.id,
      creator: user.id,
    });

    await this.usersRepository.addOrg(creatorEmail, organization.id);
    return organization;
  }

  public async addMember(orgId: MongoID, email: string): Promise<Organization> {
    const user = await this.createUser(email);

    await this.usersRepository.addOrg(email, orgId);
    const org = await this.organizationsRepository.addMember(orgId, {
      email,
      role: OrganizationRoles.ADMIN,
      user: user.id,
    });

    return org;
  }

  public async removeMember(
    orgId: MongoID,
    email: string,
  ): Promise<Organization> {
    await this.usersRepository.removeOrg(email, orgId);
    return this.organizationsRepository.removeMember(orgId, email);
  }

  public async deleteOrganization(orgId: MongoID): Promise<Organization> {
    const organization = await this.organizationsRepository.findById(orgId);

    await Promise.all(
      organization.members.map(member =>
        this.usersRepository.removeOrg(member.email, orgId),
      ),
    );

    return this.organizationsRepository.delete(orgId);
  }

  private async createUser(
    email: string,
    role: OrganizationRoles = OrganizationRoles.ADMIN,
  ): Promise<User> {
    const existingUser = await this.usersRepository.findByEmail(email);
    if (existingUser) {
      return existingUser;
    }

    const user = await this.usersRepository.create({
      name: email,
      email,
      organizations: [],
      emailVerified: false,
      picture: '',
    });

    const organization = await this.organizationsRepository.create({
      name: email,
      members: [
        {
          email,
          role,
          user: user.id,
        },
      ],
      paymentPlan: 'free',
      isPersonal: true,
      owner: user.id,
      creator: user.id,
    });

    return this.usersRepository.addOrg(email, organization.id);
  }
}
