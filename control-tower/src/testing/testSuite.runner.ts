import { Injectable, Logger } from '@nestjs/common';
import Ajv, { ErrorObject } from 'ajv';
import dayjs from 'dayjs';
import { Dictionary } from 'lodash';

import { CloudStatus } from '#src/constants/cloudStatus.constants';
import { CRASHED } from '#src/constants/namespace.constants';
import { KubernetesClient } from '#src/kubernetes/clients/kubernetes.client';
import { KubernetesService } from '#src/kubernetes/kubernetes.service';
import {
  Action,
  Namespace,
  Service,
  SuccessRate,
  TestRun,
  TestRunTestCase,
  TestSuite,
} from '#src/mongo/models';
import {
  NamespacesRepository,
  TestRunsRepository,
  TestSuitesRepository,
} from '#src/mongo/repositories';
import { MongoID } from '#src/types/mongo.types';
import sleep from '#src/utils/sleep';

@Injectable()
export class TestSuiteRunner {
  private readonly logger = new Logger(TestSuiteRunner.name);
  private readonly ajv = new Ajv({ strict: false });

  constructor(
    private readonly testSuitesRepository: TestSuitesRepository,
    private readonly testRunsRepository: TestRunsRepository,
    private readonly namespacesRepository: NamespacesRepository,
    private readonly kubernetesService: KubernetesService,
    private readonly kubernetesClient: KubernetesClient,
  ) {}

  public async runTestSuite(testSuiteId: MongoID): Promise<TestSuite> {
    const testSuite = await this.testSuitesRepository.findById(testSuiteId);
    if (testSuite.namespaces.length === 0) {
      return testSuite;
    }

    const testRun = await this.createTestRun(testSuiteId);
    const updatedTestSuite = await this.testSuitesRepository.addTestRun(
      testSuiteId,
      testRun.id,
    );

    const results = (
      await Promise.all(
        testRun.namespaces.map(namespaceId =>
          this.runNamespaceTests(namespaceId),
        ),
      )
    ).flat();

    // Need to handle failedToLaunch
    const namespaceSuccesses = results.map(r => ({
      id: r.namespaceId.toString(),
      success: !r.testRunTestCases.some(tc => !tc.success),
    }));
    const testRunTestCases = results.flatMap(r => r.testRunTestCases);
    const hasErrors = testRunTestCases.some(t => !t.success);
    const testRunTestCasesSuccesses = testRunTestCases.map(tc => ({
      id: tc.testCaseId,
      success: tc.success,
    }));

    const testSuiteSuccessRate = this.calculateNewSuccessRate(
      updatedTestSuite.successRate,
      updatedTestSuite.numberOfRuns,
      !hasErrors,
    );

    const namespaceSuccessRates = this.updateSuccessRates(
      testSuite.namespaceSuccessRates,
      namespaceSuccesses,
    );
    const testCaseSuccessRates = this.updateSuccessRates(
      testSuite.testCaseSuccessRates,
      testRunTestCasesSuccesses,
    );

    await this.testRunsRepository.endTestRun(testRun.id, testRunTestCases);
    return this.testSuitesRepository.updateSuccessRate(
      testSuiteId,
      testSuiteSuccessRate,
      testCaseSuccessRates,
      namespaceSuccessRates,
    );
  }

  private async createTestRun(testSuiteId: MongoID): Promise<TestRun> {
    const testSuite = await this.testSuitesRepository.findById(testSuiteId);
    const testRun = await this.testRunsRepository.create({
      testSuiteId,
      namespaces: [],
      startTime: new Date(),
    });

    const testRunNamespaces = await Promise.all(
      (testSuite.namespaces as Namespace[]).map(namespace =>
        this.createNamespaceTestRun(namespace, testRun.id),
      ),
    );

    return this.testRunsRepository.addNamespaces(testRun.id, testRunNamespaces);
  }

  private async createNamespaceTestRun(
    namespace: Namespace,
    testRunId: MongoID,
  ): Promise<MongoID> {
    const { id } = await this.namespacesRepository.create({
      ...namespace,
      templateId: namespace.id,
      testRunId,
      type: 'testRun',
      testCases: namespace.testCases,
      traffic: [],
      status: CloudStatus.INACTIVE,
      name: `${namespace.name} (Test Run)`,
      permissions: namespace.permissions,
      items: namespace.items.map(item => {
        if (item.itemType === 'Service') {
          (item as Service).consoleLogs = [];
        }

        return item;
      }),
    });

    return id;
  }

  private async runNamespaceTests(namespaceId: MongoID): Promise<{
    namespaceId: MongoID;
    testRunTestCases: TestRunTestCase[];
    failedToLaunch: boolean;
  }> {
    let failedToLaunch = false;
    const testRunTestCases: TestRunTestCase[] = [];
    const runningNamespace = await this.kubernetesService.startNamespace(
      namespaceId,
    );

    try {
      const namespaceHealth = await this.kubernetesService.waitForServices(
        runningNamespace.id,
      );
      if (namespaceHealth.status === CRASHED) {
        failedToLaunch = true;
        throw new Error('Error launching test environment');
      }

      // Give services extra time to startup
      await sleep(3000);

      // const testCases = runningNamespace.testCases.filter(
      //   testCase => testCase.errors?.length === 0,
      // );
      const testCases = runningNamespace.testCases;

      // TestCases should run sequentially
      for (const testCase of testCases) {
        const { execution } = testCase;
        const testRunTimestamp = dayjs();

        await this.kubernetesClient.performHttpRequest(
          runningNamespace.id,
          execution.target,
          execution.url,
          execution.method,
          execution.headers,
          execution.body,
        );

        // Give a chance for all actions to finish
        await sleep(2000);

        const { traffic } = await this.namespacesRepository.findById(
          runningNamespace.id,
        );

        const actions = traffic.filter(
          t => t.trafficType === 'Action',
        ) as Action[];

        const filteredActions = actions.filter(action =>
          dayjs(action.timestamp).isAfter(
            testRunTimestamp.subtract(1, 'second'),
          ),
        );

        const usedActions = new Set<string>();
        const testRunTestCase: TestRunTestCase = {
          namespaceId,
          testCaseId: testCase.id,
          testCaseName: testCase.name,
          assertions: [],
          success: false,
        };

        testCase.assertions.forEach(assertion => {
          const possibleActions = filteredActions.filter(a => {
            if (usedActions.has(a.id)) {
              return false;
            }

            if (a.type === 'request' && assertion.action.type === 'request') {
              if (
                a.origin === assertion.action.origin &&
                a.target === assertion.action.target &&
                a.url === assertion.action.url &&
                a.method === assertion.action.method
              ) {
                return true;
              }
            }

            if (a.type === 'response' && assertion.action.type === 'response') {
              if (
                a.origin === assertion.action.origin &&
                a.target === assertion.action.target
              ) {
                return true;
              }
            }

            return false;
          });

          const validate = this.ajv.compile(JSON.parse(assertion.schema));
          let validationErrors: ErrorObject[] | null = null;

          for (let i = 0; i < possibleActions.length; i++) {
            const action = possibleActions[i];
            validate(action);

            if (!validate.errors) {
              usedActions.add(action.id);
              validationErrors = null;
              testRunTestCase.assertions.push({
                schema: assertion.schema,
                action: possibleActions[i],
                success: true,
                errors: [],
              });
              break;
            } else if (i === 0) {
              validationErrors = validate.errors;
            }
          }

          if (!!validationErrors) {
            usedActions.add(possibleActions[0].id);
            testRunTestCase.assertions.push({
              schema: assertion.schema,
              action: possibleActions[0],
              success: false,
              errors: validationErrors.map(err => JSON.stringify(err)),
            });
          }
        });

        testRunTestCases.push({
          ...testRunTestCase,
          success: !testRunTestCase.assertions.some(a => !a.success),
        });
      }
    } catch (err) {
      this.logger.error(err);
    } finally {
      await this.kubernetesService.terminateNamespace(runningNamespace.id);
    }

    return {
      namespaceId: runningNamespace.templateId,
      failedToLaunch,
      testRunTestCases,
    };
  }

  private calculateNewSuccessRate(
    prevRate: number,
    prevNumRuns: number,
    success: boolean,
  ): number {
    const numerator = prevRate * prevNumRuns + (success ? 1 : 0);
    const denominator = prevNumRuns + 1;

    return parseFloat((numerator / denominator).toFixed(4));
  }

  private updateSuccessRates(
    curr: SuccessRate[],
    newResults: { id: string; success: boolean }[],
  ): SuccessRate[] {
    const dict = curr.reduce<Dictionary<SuccessRate>>((acc, val) => {
      return {
        ...acc,
        [val.id]: val,
      };
    }, {});

    newResults.forEach(({ id, success }) => {
      const successRate = dict[id];
      if (!successRate) {
        dict[id] = {
          id,
          numberOfRuns: 1,
          successRate: success ? 1 : 0,
        };
      } else {
        dict[id] = {
          id,
          numberOfRuns: successRate.numberOfRuns + 1,
          successRate: this.calculateNewSuccessRate(
            successRate.successRate,
            successRate.numberOfRuns,
            success,
          ),
        };
      }
    });

    return Object.values(dict);
  }
}
