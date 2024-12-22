import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import dayjs from 'dayjs';
import { Dictionary } from 'lodash';

import { CloudStatus } from '#src/constants/cloudStatus.constants';
import { BOOLEAN } from '#src/constants/environment.constants';
import { StartTestRunJobData } from '#src/constants/scheduledJobs.constants';
import { KubernetesService } from '#src/kubernetes/kubernetes.service';
import TelemetryService from '#src/kubernetes/telemetry.service';
import { ScheduledJob } from '#src/mongo/models';
import { NumericUsage } from '#src/mongo/models/telemetry.model';
import {
  NamespacesRepository,
  OrganizationsRepository,
  ScheduledJobsRepository,
} from '#src/mongo/repositories';
import { PubSubService } from '#src/pubsub/pubsub.service';
import { TestingService } from '#src/testing/testing.service';
import { TestSuiteRunner } from '#src/testing/testSuite.runner';

@Injectable()
export class ScheduledJobsService {
  private readonly logger = new Logger(ScheduledJobsService.name);

  constructor(
    private readonly scheduledJobsRepository: ScheduledJobsRepository,
    private readonly testingService: TestingService,
    private readonly testSuiteRunner: TestSuiteRunner,
    private readonly kubernetesService: KubernetesService,
    private readonly telemetryService: TelemetryService,
    private readonly namespacesRepository: NamespacesRepository,
    private readonly organizationsRepository: OrganizationsRepository,
    private readonly pubsubService: PubSubService,
  ) {}

  // @Cron(CronExpression.EVERY_5_SECONDS)
  public async monitorUsage(): Promise<void> {
    try {
      if (process.env.ENABLE_METRICS === BOOLEAN.TRUE) {
        await this.telemetryService.monitorUsage();
      }
    } catch (err) {
      this.logger.error(err);
    }
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  public async runJobs(): Promise<void> {
    const jobs = await this.scheduledJobsRepository.getAll();

    await Promise.all(
      jobs.map(job => {
        switch (job.type) {
          case 'START_TEST_RUN': {
            return this.handleStartTestRunJob(job);
          }
          default: {
            return Promise.resolve(null);
          }
        }
      }),
    );
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  public async terminateUnusedNamespaces(): Promise<void> {
    const tenMinAgo = dayjs().subtract(10, 'minutes').toDate();
    const namespaces = await this.namespacesRepository.find({
      type: 'sandbox',
      status: CloudStatus.ACTIVE,
      $or: [
        { lastUsedAt: { $exists: false } },
        { lastUsedAt: { $lt: tenMinAgo } },
      ],
    });

    await Promise.all(
      namespaces.map(ns => this.kubernetesService.terminateNamespace(ns.id)),
    );
  }

  @Cron(CronExpression.EVERY_5_SECONDS)
  public async checkNamespaceHealthAndUsage(): Promise<void> {
    const namespaces = await this.namespacesRepository.find({
      status: { $in: [CloudStatus.ACTIVE, CloudStatus.TERMINATING] },
    });

    const updatedNamespaces = await Promise.all(
      namespaces.map(async namespace => {
        const namespaceHealth =
          await this.kubernetesService.checkNamespaceHealthAndUsage(
            namespace.id,
          );
        namespace.usage = namespaceHealth.usage;
        return namespace;
      }),
    );

    const orgUsage = updatedNamespaces.reduce<Dictionary<NumericUsage>>(
      (agg, ns) => {
        const orgId = ns.permissions.organizationId.toString();
        return {
          ...agg,
          [orgId]: {
            cpu: (agg[orgId]?.cpu ?? 0) + (ns.usage?.cpu ?? 0),
            memory: (agg[orgId]?.memory ?? 0) + (ns.usage?.memory ?? 0),
          },
        };
      },
      {},
    );

    await Promise.all(
      Object.entries(orgUsage).map(async ([orgId, usage]) => {
        await this.organizationsRepository.addUsage(orgId, usage);
        await this.pubsubService.publish('organizationUsage', {
          orgId,
          usage: {
            ...usage,
            timestamp: new Date(),
          },
        });
      }),
    );
  }

  // @Cron(CronExpression.EVERY_10_SECONDS)
  public async monitorNamespaceActiveUsers(): Promise<void> {
    const namespaces = await this.namespacesRepository.find({
      $where: 'this.activeUsers.length > 0',
    });

    await Promise.all([
      namespaces.map(async namespace => {
        await namespace.activeUsers.map(async user => {
          if (
            !user.heartbeat ||
            dayjs().isAfter(dayjs(user.heartbeat).add(1, 'minute'))
          ) {
            const updatedNamespace =
              await this.namespacesRepository.removeActiveUser(
                namespace.id,
                user.peerId,
              );

            await this.pubsubService.publish('namespaceActiveUsers', {
              orgId: namespace.permissions.organizationId,
              namespaceId: namespace.id.toString(),
              activeUsers: updatedNamespace.activeUsers,
            });
          }
        });
      }),
    ]);
  }

  private async handleStartTestRunJob(job: ScheduledJob): Promise<void> {
    try {
      const { testSuiteId } = job.data as StartTestRunJobData;
      const testSuite = await this.testSuiteRunner.runTestSuite(testSuiteId);

      await this.scheduledJobsRepository.delete(job.id);
      await this.testingService.scheduleTestRun(testSuite);
    } catch (err) {}
  }
}
