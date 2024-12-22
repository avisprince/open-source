import { Injectable, Logger } from '@nestjs/common';
import Ajv from 'ajv';
import { parseExpression } from 'cron-parser';

import { TestRun, TestSuite } from '#src/mongo/models';
import {
  NamespacesRepository,
  ScheduledJobsRepository,
  TestRunsRepository,
  TestSuitesRepository,
} from '#src/mongo/repositories';
import { TestSuiteInput } from '#src/resolverInputs/testSuite.input';
import { MongoID } from '#src/types/mongo.types';

@Injectable()
export class TestingService {
  private readonly logger = new Logger(TestingService.name);
  private readonly ajv = new Ajv({ strict: false });

  constructor(
    private readonly testSuitesRepository: TestSuitesRepository,
    private readonly testRunsRepository: TestRunsRepository,
    private readonly namespacesRepository: NamespacesRepository,
    private readonly scheduledJobsRepository: ScheduledJobsRepository,
  ) {}

  public getOrgTestSuites(organizationId: MongoID): Promise<TestSuite[]> {
    return this.testSuitesRepository.find({
      'permissions.organizationId': organizationId,
    });
  }

  public async createTestSuite(
    testSuiteInput: Partial<TestSuite>,
  ): Promise<TestSuite> {
    const testSuite = await this.testSuitesRepository.create(testSuiteInput);

    if (testSuite.schedule) {
      await this.scheduleTestRun(testSuite);
    }

    // Return a populated TestSuite
    return this.testSuitesRepository.findById(testSuite.id);
  }

  public async updateTestSuite(
    testSuiteId: MongoID,
    testSuite: TestSuiteInput,
  ): Promise<TestSuite> {
    const updatedTestSuite = await this.testSuitesRepository.update(
      testSuiteId,
      testSuite,
    );
    await this.deleteScheduledTestRun(testSuiteId);
    await this.scheduleTestRun(updatedTestSuite);

    return updatedTestSuite;
  }

  public async deleteTestSuite(testSuiteId: MongoID): Promise<TestSuite> {
    const testSuite = await this.testSuitesRepository.findById(testSuiteId);

    await Promise.all([
      this.deleteScheduledTestRun(testSuiteId),
      ...(testSuite.testRuns as TestRun[]).map(tr => this.deleteTestRun(tr.id)),
    ]);

    return this.testSuitesRepository.delete(testSuiteId);
  }

  public async scheduleTestRun(testSuite: TestSuite): Promise<void> {
    if (!testSuite.schedule) {
      return;
    }

    await this.scheduledJobsRepository.create({
      type: 'START_TEST_RUN',
      startTime: parseExpression(testSuite.schedule).next().toDate(),
      data: {
        testSuiteId: testSuite.id,
      },
    });
  }

  private async deleteScheduledTestRun(testSuiteId: MongoID): Promise<void> {
    await this.scheduledJobsRepository.findAndDeleteJob({
      'data.testSuiteId': testSuiteId,
    });
  }

  private async deleteTestRun(testRunId: MongoID): Promise<void> {
    const testRun = await this.testRunsRepository.findById(testRunId);

    await Promise.all(
      (testRun.namespaces as MongoID[]).map(id => {
        return this.namespacesRepository.archive(id);
      }),
    );

    await this.testRunsRepository.delete(testRunId);
  }
}
