/* eslint-disable @typescript-eslint/no-unused-vars */

import { Args, ID, Resolver, Subscription } from '@nestjs/graphql';

import { Action, ConsoleLog, NamespaceItem, QueryLog } from '#src/mongo/models';
import { NumericUsageWithTimestamp } from '#src/mongo/models/telemetry.model';
import { PubSubService } from '#src/pubsub/pubsub.service';
import {
  DeleteNamespaceItemsOutput,
  NamespaceActiveUsersOutput,
  NamespaceHealthPayload,
  NamespaceHealthSubscriptionOutput,
  OrganizationUsagePayload,
} from '#src/resolverOutputs/subscriptions.output';
import { MongoID } from '#src/types/mongo.types';

@Resolver()
export class SubscriptionResolver {
  constructor(private readonly pubsubService: PubSubService) {}

  @Subscription(() => NamespaceItem, {
    name: 'newNamespaceItem',
    resolve(this, value: { namespaceId: MongoID; item: NamespaceItem }) {
      return value.item;
    },
    filter(payload: { namespaceId: MongoID; item: NamespaceItem }, variables) {
      return payload.namespaceId.toString() === variables.namespaceId;
    },
  })
  public newNamespaceItem(
    @Args('namespaceId', { type: () => ID }) namespaceId: MongoID,
  ) {
    return this.pubsubService.asyncIterator('newNamespaceItem');
  }

  @Subscription(() => NamespaceItem, {
    name: 'updateNamespaceItem',
    resolve(this, value: { namespaceId: MongoID; item: NamespaceItem }) {
      return value.item;
    },
    filter(payload: { namespaceId: MongoID; item: NamespaceItem }, variables) {
      return payload.namespaceId.toString() === variables.namespaceId;
    },
  })
  public updateNamespaceItem(
    @Args('namespaceId', { type: () => ID }) namespaceId: MongoID,
  ) {
    return this.pubsubService.asyncIterator('updateNamespaceItem');
  }

  @Subscription(() => DeleteNamespaceItemsOutput, {
    name: 'deleteNamespaceItems',
    resolve(
      this,
      value: { namespaceId: MongoID; deletedItems: DeleteNamespaceItemsOutput },
    ) {
      return value.deletedItems;
    },
    filter(
      payload: {
        namespaceId: MongoID;
        deletedItems: DeleteNamespaceItemsOutput;
      },
      variables,
    ) {
      return payload.namespaceId.toString() === variables.namespaceId;
    },
  })
  public deleteNamespaceItems(
    @Args('namespaceId', { type: () => ID }) namespaceId: MongoID,
  ) {
    return this.pubsubService.asyncIterator('deleteNamespaceItems');
  }

  @Subscription(() => Action, {
    name: 'actionLogged',
    resolve(this, value: Action) {
      return value;
    },
    filter(payload: Action, variables) {
      return payload.namespace.toString() === variables.namespaceId;
    },
  })
  public actionLogged(
    @Args('namespaceId', { type: () => ID }) namespaceId: MongoID,
  ) {
    return this.pubsubService.asyncIterator('actionLogged');
  }

  @Subscription(() => QueryLog, {
    name: 'queryLogged',
    resolve(this, value: { queryLog: QueryLog }) {
      return value.queryLog;
    },
    filter(payload: { namespaceId: string; queryLog: QueryLog }, variables) {
      return payload.namespaceId === variables.namespaceId;
    },
  })
  public queryLogged(
    @Args('namespaceId', { type: () => ID }) namespaceId: MongoID,
  ) {
    return this.pubsubService.asyncIterator('queryLogged');
  }

  @Subscription(() => [ConsoleLog], {
    name: 'consoleLogged',
    resolve(this, value: { consoleLogs: ConsoleLog[] }) {
      return value.consoleLogs;
    },
    filter(
      payload: { namespaceId: string; consoleLogs: ConsoleLog[] },
      variables,
    ) {
      return payload.namespaceId === variables.namespaceId;
    },
  })
  public consoleLogged(
    @Args('namespaceId', { type: () => ID }) namespaceId: MongoID,
  ) {
    return this.pubsubService.asyncIterator('consoleLogged');
  }

  @Subscription(() => NamespaceHealthSubscriptionOutput, {
    name: 'namespaceHealth',
    resolve(this, value: NamespaceHealthPayload) {
      return {
        namespaceId: value.namespaceId,
        namespaceHealth: value.namespaceHealth,
      };
    },
    filter(payload: NamespaceHealthPayload, variables) {
      return payload.orgId === variables.orgId;
    },
  })
  public namespaceHealth(@Args('orgId', { type: () => ID }) orgId?: MongoID) {
    return this.pubsubService.asyncIterator('namespaceHealth');
  }

  @Subscription(() => NumericUsageWithTimestamp, {
    name: 'organizationUsage',
    resolve(this, value: OrganizationUsagePayload) {
      return value.usage;
    },
    filter(payload: OrganizationUsagePayload, variables) {
      return payload.orgId === variables.orgId;
    },
  })
  public organizationUsage(@Args('orgId', { type: () => ID }) orgId?: MongoID) {
    return this.pubsubService.asyncIterator('organizationUsage');
  }

  @Subscription(() => NamespaceActiveUsersOutput, {
    name: 'namespaceActiveUsers',
    resolve(this, value: NamespaceActiveUsersOutput) {
      return value;
    },
    filter(payload: NamespaceActiveUsersOutput, variables) {
      return (
        payload.namespaceId === variables.namespaceId ||
        payload.orgId === variables.orgId
      );
    },
  })
  public namespaceActiveUsers(
    @Args('namespaceId', { type: () => ID }) namespaceId?: MongoID,
    @Args('orgId', { type: () => ID }) orgId?: MongoID,
  ) {
    return this.pubsubService.asyncIterator('namespaceActiveUsers');
  }
}
