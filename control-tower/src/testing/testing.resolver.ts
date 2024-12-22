import { UseGuards } from '@nestjs/common';
import { Args, Context, ID, Mutation, Query, Resolver } from '@nestjs/graphql';

import {
  CreateGuard,
  CreateOperationGuard,
} from '#src/auth/authorization/create.guard';
import {
  DeleteGuard,
  DeleteOperationGuard,
} from '#src/auth/authorization/delete.guard';
import {
  ReadGuard,
  ReadOperationGuard,
} from '#src/auth/authorization/read.guard';
import {
  UpdateGuard,
  UpdateOperationGuard,
} from '#src/auth/authorization/update.guard';
import { GqlUserStrategy } from '#src/auth/strategies/gqlUser.strategy';
import { Organization, TestSuite } from '#src/mongo/models';
import { TestSuiteInput } from '#src/resolverInputs/testSuite.input';
import { TestingService } from '#src/testing/testing.service';
import { TestSuiteRunner } from '#src/testing/testSuite.runner';
import Ctx from '#src/types/graphql.context.type';
import { MongoID } from '#src/types/mongo.types';

const ORGANIZATION_ID = 'organizationId';
const TEST_SUITE_ID = 'testSuiteId';

const returnTestSuite = () => TestSuite;
const returnTestSuitesArr = () => [TestSuite];

@UseGuards(
  GqlUserStrategy,
  CreateOperationGuard,
  ReadOperationGuard,
  UpdateOperationGuard,
  DeleteOperationGuard,
)
@Resolver(returnTestSuite)
export class TestingResolver {
  constructor(
    private readonly testingService: TestingService,
    private readonly testSuiteRunner: TestSuiteRunner,
  ) {}

  @Query(returnTestSuitesArr)
  @ReadGuard({
    className: Organization.name,
    param: ORGANIZATION_ID,
  })
  public orgTestSuites(
    @Args(ORGANIZATION_ID, { type: () => ID }) organizationId: MongoID,
  ): Promise<TestSuite[]> {
    return this.testingService.getOrgTestSuites(organizationId);
  }

  @Mutation(returnTestSuite)
  @CreateGuard({ param: ORGANIZATION_ID })
  public createTestSuite(
    @Context() { req }: Ctx,
    @Args(ORGANIZATION_ID, { type: () => ID }) organizationId: MongoID,
    @Args('testSuite', { type: () => TestSuiteInput })
    testSuite: TestSuiteInput,
  ): Promise<TestSuite> {
    const { email } = req.user;

    return this.testingService.createTestSuite({
      name: testSuite.name,
      description: testSuite.description,
      namespaces: testSuite.namespaces ?? [],
      testRuns: [],
      numberOfRuns: 0,
      successRate: 0,
      testCaseSuccessRates: [],
      schedule: null,
      permissions: {
        organizationId,
        author: email,
        owner: email,
        memberOverrides: [],
      },
    });
  }

  @Mutation(returnTestSuite)
  @UpdateGuard({
    className: TestSuite.name,
    param: TEST_SUITE_ID,
  })
  public updateTestSuite(
    @Args(TEST_SUITE_ID, { type: () => ID }) testSuiteId: MongoID,
    @Args('testSuite', { type: () => TestSuiteInput })
    testSuite: TestSuiteInput,
  ): Promise<TestSuite> {
    return this.testingService.updateTestSuite(testSuiteId, testSuite);
  }

  @Mutation(returnTestSuite)
  @UpdateGuard({
    className: TestSuite.name,
    param: TEST_SUITE_ID,
  })
  public async runTestSuite(
    @Args(TEST_SUITE_ID, { type: () => ID }) testSuiteId: MongoID,
  ): Promise<TestSuite> {
    return this.testSuiteRunner.runTestSuite(testSuiteId);
  }

  @Mutation(returnTestSuite)
  @DeleteGuard({
    className: TestSuite.name,
    param: TEST_SUITE_ID,
  })
  public async deleteTestSuite(
    @Args(TEST_SUITE_ID, { type: () => ID }) testSuiteId: MongoID,
  ): Promise<TestSuite> {
    return this.testingService.deleteTestSuite(testSuiteId);
  }
}
