import { Injectable } from '@nestjs/common';
import { Dictionary } from 'lodash';
import { v4 as uuid } from 'uuid';

import { CloudStatus } from '#src/constants/cloudStatus.constants';
import { DOKKIMI } from '#src/constants/environment.constants';
import { KubernetesService } from '#src/kubernetes/kubernetes.service';
import {
  Action,
  Database,
  DatabaseTemplate,
  DbQuery,
  DbQueryTemplate,
  HttpRequest,
  HttpRequestTemplate,
  ItemTemplate,
  MockEndpoint,
  MockEndpointTemplate,
  Namespace,
  NamespaceItem,
  NamespaceItemTemplate,
  NamespaceType,
  QueryLog,
  Service,
  ServiceTemplate,
  TestCase,
  TestCaseAssertion,
  User,
} from '#src/mongo/models';
import { NamespacesRepository } from '#src/mongo/repositories';
import { NamespaceItemTemplatesService } from '#src/namespaceItemTemplates/namespaceItemTemplates.service';
import { PubSubService } from '#src/pubsub/pubsub.service';
import { CanvasInfoInput } from '#src/resolverInputs/namespaceItemInputs/canvasInfo.input';
import {
  NamespaceInput,
  NamespaceItemInput,
  NamespaceItemInputType,
  NamespaceItemPositionInput,
  NewNamespaceItemInput,
} from '#src/resolverInputs/namespaces.input';
import {
  TestCaseAssertionInput,
  TestCaseInput,
} from '#src/resolverInputs/testCase.input';
import { MongoID } from '#src/types/mongo.types';

@Injectable()
export class NamespacesService {
  constructor(
    private readonly namespacesRepository: NamespacesRepository,
    private readonly kubernetesService: KubernetesService,
    private readonly pubsubService: PubSubService,
    private readonly namespaceItemTemplatesService: NamespaceItemTemplatesService,
  ) {}

  public getNamespaces(
    organizationId: MongoID,
    type: NamespaceType,
  ): Promise<Namespace[]> {
    return this.namespacesRepository.find({
      isArchived: false || undefined,
      'permissions.organizationId': organizationId,
      type,
    });
  }

  public async getUserNamespaces(user: User): Promise<Namespace[]> {
    return this.namespacesRepository.find({
      isArchived: false || undefined,
      'permissions.organizationId': {
        $in: user.organizations.map(org => org.id),
      },
      type: 'sandbox',
    });
  }

  public getNamespace(id: MongoID): Promise<Namespace> {
    return this.namespacesRepository.findById(id);
  }

  public createNamespace(namespace: Partial<Namespace>): Promise<Namespace> {
    return this.namespacesRepository.create(namespace);
  }

  public async duplicateNamespace(
    namespaceId: MongoID,
    organizationId: MongoID,
    user: User,
  ): Promise<Namespace> {
    const namespace = await this.namespacesRepository.findById(namespaceId);

    return this.namespacesRepository.create({
      ...namespace,
      type: 'sandbox',
      traffic: [],
      status: CloudStatus.INACTIVE,
      name: `${namespace.name} (Duplicate)`,
      items: namespace.items.map(item => {
        if (item.itemType === 'Service') {
          (item as Service).consoleLogs = [];
        }

        return item;
      }),
      permissions: {
        organizationId,
        author: user.email,
        owner: user.email,
        memberOverrides: [],
      },
    });
  }

  public updateNamespace(
    id: MongoID,
    namespace: NamespaceInput,
  ): Promise<Namespace> {
    return this.namespacesRepository.update(id, namespace);
  }

  public async addItem(
    namespaceId: MongoID,
    item: NewNamespaceItemInput,
  ): Promise<NamespaceItem> {
    const newItem = await this.namespacesRepository.addItem(
      namespaceId,
      item as Partial<NamespaceItem>,
    );

    await this.pubsubService.publish('newNamespaceItem', {
      namespaceId,
      item: newItem,
    });

    return newItem;
  }

  public async duplicateItem(
    namespaceId: MongoID,
    itemId: string,
    posX: number,
    posY: number,
  ): Promise<NamespaceItem> {
    const namespace = await this.namespacesRepository.findById(namespaceId);
    const item = namespace.items.find(item => item.itemId === itemId);

    // This is buggy as it will also copy console logs
    const newItem = await this.namespacesRepository.addItem(namespaceId, {
      ...item,
      canvasInfo: {
        ...item.canvasInfo,
        posX,
        posY,
      },
    });

    await this.pubsubService.publish('newNamespaceItem', {
      namespaceId,
      item: newItem,
    });

    return newItem;
  }

  public async updateItem(
    namespaceId: MongoID,
    itemInput: NamespaceItemInput,
  ): Promise<NamespaceItem> {
    const namespaceItem = this.extractNamespaceItem(itemInput);
    const namespace = await this.namespacesRepository.updateItem(
      namespaceId,
      namespaceItem,
    );

    const item = namespace.items.find(
      item => item.itemId === namespaceItem.itemId,
    );

    await this.pubsubService.publish('updateNamespaceItem', {
      namespaceId,
      item,
    });

    if (namespace.status === CloudStatus.ACTIVE) {
      if (item.itemType === 'MockEndpoint') {
        await this.kubernetesService.patchNamespaceItem(namespace, item);
      }
    }

    return item;
  }

  public async updateItemPosition(
    namespaceId: MongoID,
    itemPosition: NamespaceItemPositionInput,
  ): Promise<NamespaceItem> {
    const item = await this.namespacesRepository.updateItemPosition(
      namespaceId,
      itemPosition,
    );

    await this.pubsubService.publish('updateNamespaceItem', {
      namespaceId,
      item,
    });

    return item;
  }

  public async deleteItem(
    namespaceId: MongoID,
    itemId: string,
  ): Promise<NamespaceItem[]> {
    const { items } = await this.namespacesRepository.findById(namespaceId);
    let deletedItems: NamespaceItem[] = [];

    await Promise.all(
      items.map(async item => {
        if (item.itemId === itemId) {
          await this.kubernetesService.terminateNamespaceItem(
            namespaceId,
            itemId,
          );
          await this.namespacesRepository.deleteItem(namespaceId, itemId);
          const deletedTrafficItemIds = await this.deleteTrafficHistoryItems(
            namespaceId,
            itemId,
          );
          const deletedQueryItemIds = await this.deleteQueryHistoryItems(
            namespaceId,
            itemId,
          );

          deletedItems = deletedItems
            .concat(item)
            .concat(deletedTrafficItemIds)
            .concat(deletedQueryItemIds);
        } else if (
          item.itemType === 'HttpRequest' &&
          (item as HttpRequest).target === itemId
        ) {
          await this.namespacesRepository.updateItem(namespaceId, {
            ...item,
            target: null,
          });
        }
      }),
    );

    await this.pubsubService.publish('deleteNamespaceItems', {
      namespaceId,
      deletedItems: {
        itemIds: deletedItems.map(item => item.itemId),
      },
    });

    return deletedItems;
  }

  public async deleteNamespace(id: MongoID): Promise<Namespace> {
    const namespace = await this.namespacesRepository.findById(id);

    if (namespace.status === CloudStatus.ACTIVE) {
      await this.kubernetesService.terminateNamespace(id);
    }

    return this.namespacesRepository.archive(id);
  }

  public async logAction(namespaceId: MongoID, action: Action): Promise<void> {
    const { trafficHistories, items } =
      await this.namespacesRepository.addTraffic(namespaceId, action);

    if (action.type === 'request' && action.origin !== DOKKIMI) {
      const { origin, target } = action;

      const trafficHistory = trafficHistories.find(({ displayName }) => {
        return (
          displayName === `${origin}-${target}` ||
          displayName === `${target}-${origin}`
        );
      });

      if (!trafficHistory) {
        const item1 = items.find(item => item.itemId === origin);
        const item2 = items.find(item => item.itemId === target);

        const newItem = await this.namespacesRepository.addItem(namespaceId, {
          itemType: 'TrafficHistory',
          displayName: `${origin}-${target}`,
          node1: origin,
          node2: target,
          canvasInfo: {
            posX: (item1.canvasInfo.posX + item2.canvasInfo.posX) / 2,
            posY: (item1.canvasInfo.posY + item2.canvasInfo.posY) / 2,
            height: 136,
            width: 548,
          },
        } as Partial<NamespaceItem>);

        await this.pubsubService.publish('newNamespaceItem', {
          namespaceId,
          item: newItem,
        });
      }
    }
  }

  public async logQuery(
    namespaceId: MongoID | string,
    query: QueryLog,
  ): Promise<void> {
    const { queryHistories, services, databases } =
      await this.namespacesRepository.addTraffic(namespaceId, query);

    const { originItemId, databaseItemId } = query;

    if (originItemId === DOKKIMI) {
      return;
    }

    const queryHistory = queryHistories.find(({ displayName }) => {
      return displayName === `${originItemId}-${databaseItemId}`;
    });

    if (!queryHistory) {
      const service = services.find(item => item.itemId === originItemId);
      const database = databases.find(item => item.itemId === databaseItemId);

      const newItem = await this.namespacesRepository.addItem(namespaceId, {
        itemType: 'QueryHistory',
        displayName: `${service.itemId}-${database.itemId}`,
        originItemId: service.itemId,
        databaseItemId: database.itemId,
        canvasInfo: {
          posX: (service.canvasInfo.posX + database.canvasInfo.posX) / 2,
          posY: (service.canvasInfo.posY + database.canvasInfo.posY) / 2,
          height: 136,
          width: 548,
        },
      } as Partial<NamespaceItem>);

      await this.pubsubService.publish('newNamespaceItem', {
        namespaceId,
        item: newItem,
      });
    }
  }

  public async saveItemAsTemplate(
    namespaceId: MongoID,
    itemId: string,
  ): Promise<NamespaceItemTemplate> {
    const namespace = await this.namespacesRepository.findById(namespaceId);
    const item = namespace.items.find(item => item.itemId === itemId);
    const itemTemplate = this.convertItemToTemplate(item);

    return this.namespaceItemTemplatesService.createNamespaceItemTemplate({
      template: itemTemplate,
      permissions: namespace.permissions,
      updatedAt: new Date(),
    });
  }

  public async addTemplateToNamespace(
    namespaceId: MongoID,
    templateId: MongoID,
    canvasInfo: CanvasInfoInput,
  ): Promise<NamespaceItem> {
    const { template } =
      await this.namespaceItemTemplatesService.getNamespaceItemTemplate(
        templateId,
      );

    const item = await this.namespacesRepository.addItem(namespaceId, {
      ...template,
      canvasInfo,
    } as NamespaceItem);

    await this.pubsubService.publish('newNamespaceItem', {
      namespaceId,
      item,
    });

    return item;
  }

  public async handleActiveUserHeartbeat(
    namespaceId: MongoID,
    connectionId: string,
  ): Promise<void> {
    await this.namespacesRepository.updateActiveUserHeartbeat(
      namespaceId,
      connectionId,
    );
  }

  public clearNamespaceTraffic(namespaceId: MongoID): Promise<Namespace> {
    return this.namespacesRepository.clearNamespaceTraffic(namespaceId);
  }

  public async createTestCase(
    namespaceId: MongoID,
    testCaseInput: TestCaseInput,
  ): Promise<Namespace> {
    const testCase = await this.initializeTestCase(namespaceId, testCaseInput);

    return this.namespacesRepository.createTestCase(namespaceId, testCase);
  }

  public async updateTestCase(
    namespaceId: MongoID,
    testCaseInput: TestCaseInput,
  ): Promise<Namespace> {
    const namespace = await this.namespacesRepository.findById(namespaceId);
    const testCase = namespace.testCases.find(t => t.id === testCaseInput.id);

    if (!testCase) {
      return namespace;
    }

    // If the execution has changed, then all the assertions have changed
    if (testCase.execution.id !== testCaseInput.execution) {
      const testCase = await this.initializeTestCase(
        namespaceId,
        testCaseInput,
      );

      return this.namespacesRepository.updateTestCase(namespaceId, testCase);
    }

    testCase.name = testCaseInput.name;
    testCase.assertions = await Promise.all(
      testCaseInput.assertions.map(async (assertion, index) => {
        if (
          index >= testCase.assertions.length ||
          testCase.assertions[index].action.id !== assertion.action
        ) {
          return this.assertionInputToAssertion(namespaceId, assertion);
        }

        return {
          schema: assertion.schema,
          action: testCase.assertions[index].action,
        };
      }),
    );

    return this.namespacesRepository.updateTestCase(namespaceId, testCase);
  }

  public async updateTestOrder(namespaceId: MongoID, testCaseIds: string[]) {
    const { testCases } = await this.namespacesRepository.findById(namespaceId);
    const tests = testCases.reduce<Dictionary<TestCase>>(
      (acc, testCase) => ({
        ...acc,
        [testCase.id]: testCase,
      }),
      {},
    );

    const reorderedTests = testCaseIds.map(id => tests[id]);
    return this.namespacesRepository.update(namespaceId, {
      testCases: reorderedTests,
    });
  }

  public deleteTestCase(
    namespaceId: MongoID,
    testCaseId: string,
  ): Promise<Namespace> {
    return this.namespacesRepository.deleteTestCase(namespaceId, testCaseId);
  }

  private async initializeTestCase(
    namespaceId: MongoID,
    testCaseInput: TestCaseInput,
  ): Promise<TestCase> {
    const execution = await this.namespacesRepository.findAction(
      namespaceId,
      testCaseInput.execution,
    );
    const assertions = await Promise.all(
      testCaseInput.assertions.map(assertion => {
        return this.assertionInputToAssertion(namespaceId, assertion);
      }),
    );

    return {
      id: testCaseInput.id ?? uuid(),
      name: testCaseInput.name,
      execution,
      assertions,
    };
  }

  private async assertionInputToAssertion(
    namespaceId: MongoID,
    assertion: TestCaseAssertionInput,
  ): Promise<TestCaseAssertion> {
    const action = await this.namespacesRepository.findAction(
      namespaceId,
      assertion.action,
    );

    return {
      schema: assertion.schema,
      action,
    };
  }

  private convertItemToTemplate(item: NamespaceItem): ItemTemplate {
    switch (item.itemType) {
      case 'Service': {
        const service = item as Service;
        return {
          itemType: 'Service',
          displayName: service.displayName,
          port: service.port,
          domain: service.domain,
          image: service.image,
          healthCheck: service.healthCheck,
          env: service.env,
          dockerRegistrySecret: service.dockerRegistrySecret,
        } as ServiceTemplate;
      }
      case 'Database': {
        const database = item as Database;
        return {
          itemType: 'Database',
          displayName: database.displayName,
          database: database.database,
          initFile: database.initFile,
        } as DatabaseTemplate;
      }
      case 'HttpRequest': {
        const httpRequest = item as HttpRequest;
        return {
          itemType: 'HttpRequest',
          displayName: httpRequest.displayName,
          method: httpRequest.method,
          target: null,
          protocol: httpRequest.protocol,
          path: httpRequest.path,
          headers: httpRequest.headers,
          body: httpRequest.body,
        } as HttpRequestTemplate;
      }
      case 'MockEndpoint': {
        const mockEndpoint = item as MockEndpoint;
        return {
          itemType: 'MockEndpoint',
          displayName: mockEndpoint.displayName,
          method: mockEndpoint.method,
          origin: mockEndpoint.origin,
          target: mockEndpoint.target,
          path: mockEndpoint.path,
          delayMS: mockEndpoint.delayMS,
          responseStatus: mockEndpoint.responseStatus,
          responseHeaders: mockEndpoint.responseHeaders,
          responseBody: mockEndpoint.responseBody,
        } as MockEndpointTemplate;
      }
      case 'DbQuery': {
        const dbQuery = item as DbQuery;
        return {
          itemType: 'DbQuery',
          displayName: dbQuery.displayName,
          target: null,
          query: dbQuery.query,
          useDatabase: dbQuery.useDatabase,
        } as DbQueryTemplate;
      }
    }
  }

  private extractNamespaceItem(
    item: NamespaceItemInput,
  ): NamespaceItemInputType {
    switch (item.itemType) {
      case 'Service': {
        return item.service;
      }
      case 'Database': {
        return item.database;
      }
      case 'HttpRequest': {
        return item.httpRequest;
      }
      case 'MockEndpoint': {
        return item.mockEndpoint;
      }
      case 'DbQuery': {
        return item.dbQuery;
      }
      case 'TrafficHistory': {
        return item.trafficHistory;
      }
      case 'QueryHistory': {
        return item.queryHistory;
      }
      default: {
        return null;
      }
    }
  }

  private async deleteTrafficHistoryItems(
    namespaceId: MongoID,
    itemId: string,
  ): Promise<NamespaceItem[]> {
    const { trafficHistories } = await this.namespacesRepository.findById(
      namespaceId,
    );
    const deletedIds: NamespaceItem[] = [];

    await Promise.all(
      trafficHistories.map(async trafficHistory => {
        if (
          trafficHistory.node1 === itemId ||
          trafficHistory.node2 === itemId
        ) {
          deletedIds.push(trafficHistory);
          await this.namespacesRepository.deleteItem(
            namespaceId,
            trafficHistory.itemId,
          );
        }
      }),
    );

    return deletedIds;
  }

  private async deleteQueryHistoryItems(
    namespaceId: MongoID,
    itemId: string,
  ): Promise<NamespaceItem[]> {
    const { queryHistories } = await this.namespacesRepository.findById(
      namespaceId,
    );
    const deletedIds: NamespaceItem[] = [];

    await Promise.all(
      queryHistories.map(async queryHistory => {
        if (
          queryHistory.originItemId === itemId ||
          queryHistory.databaseItemId === itemId
        ) {
          deletedIds.push(queryHistory);
          await this.namespacesRepository.deleteItem(
            namespaceId,
            queryHistory.itemId,
          );
        }
      }),
    );

    return deletedIds;
  }
}
