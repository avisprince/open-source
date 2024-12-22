import { Injectable } from '@nestjs/common';
import dayjs from 'dayjs';

import { DemoAccountConfig } from '#src/admin/admin.controller';
import { demoNamespace } from '#src/admin/demoNamespaces';
import { OrganizationRoles } from '#src/constants/roles.constants';
import {
  NamespacesRepository,
  OrganizationsRepository,
  ScheduledJobsRepository,
  UsersRepository,
} from '#src/mongo/repositories';
import { MongoID } from '#src/types/mongo.types';

@Injectable()
export class AdminService {
  constructor(
    private readonly orgsRepository: OrganizationsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly scheduledJobsRepository: ScheduledJobsRepository,
    private readonly namespacesRepository: NamespacesRepository,
  ) {}

  public async createDemoAccount(config: DemoAccountConfig): Promise<void> {
    const { email } = config;

    const orgId = await this.createOrgAccount(email);
    await this.createDemoNamespaces(email, orgId);
  }

  public async extendDemoAccount(
    organizationId: string,
    numDays: number,
  ): Promise<void> {
    const job = await this.scheduledJobsRepository.findOne({
      type: 'END_DEMO_TRIAL',
      'data.organizationId': organizationId,
    });

    if (!!job) {
      await this.scheduledJobsRepository.update(job.id, {
        startTime: dayjs(job.startTime).add(numDays, 'days').toDate(),
      });
    }
  }

  private async createOrgAccount(email: string): Promise<MongoID> {
    const existingUser = await this.usersRepository.findByEmail(email);
    if (existingUser) {
      const organizations = await this.orgsRepository.find({ name: email });
      return organizations[0].id;
    }

    const newUser = await this.usersRepository.create({
      name: email,
      email,
      organizations: [],
      emailVerified: false,
      picture: '',
    });

    const organization = await this.orgsRepository.create({
      name: email,
      members: [
        {
          email,
          role: OrganizationRoles.ADMIN,
          user: newUser.id,
        },
      ],
      paymentPlan: 'free',
      isPersonal: true,
      owner: newUser.id,
      creator: newUser.id,
    });

    await this.usersRepository.addOrg(email, organization.id);
    return organization.id;
  }

  private async createDemoNamespaces(
    email: string,
    organizationId: MongoID,
  ): Promise<void> {
    const namespace = demoNamespace(email, organizationId);
    await this.namespacesRepository.create(namespace);
  }
}
