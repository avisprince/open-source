import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Resolver } from '@nestjs/graphql';

import {
  UpdateGuard,
  UpdateOperationGuard,
} from '#src/auth/authorization/update.guard';
import { GqlUserStrategy } from '#src/auth/strategies/gqlUser.strategy';
import { KubernetesClient } from '#src/kubernetes/clients/kubernetes.client';
import { KubernetesService } from '#src/kubernetes/kubernetes.service';
import { Namespace, NamespaceItemId } from '#src/mongo/models';
import { DatabaseQueryResultOutput } from '#src/resolverOutputs/databaseQueryResult.output';
import { HttpRequestResultOutput } from '#src/resolverOutputs/httpRequestResult.output';
import { MongoID } from '#src/types/mongo.types';

const NAMESPACE_ID = 'namespaceId';

@UseGuards(GqlUserStrategy, UpdateOperationGuard)
@Resolver(() => Namespace)
export class KubernetesResolver {
  constructor(
    private readonly kubernetesService: KubernetesService,
    private readonly kubernetesClient: KubernetesClient,
  ) {}

  @Mutation(() => Namespace)
  @UpdateGuard({
    className: Namespace.name,
    param: NAMESPACE_ID,
  })
  public startNamespace(
    @Args(NAMESPACE_ID, { type: () => ID }) namespaceId: MongoID,
  ): Promise<Namespace> {
    return this.kubernetesService.startNamespace(namespaceId);
  }

  @Mutation(() => Namespace)
  @UpdateGuard({
    className: Namespace.name,
    param: NAMESPACE_ID,
  })
  public terminateNamespace(
    @Args(NAMESPACE_ID, { type: () => ID }) namespaceId: MongoID,
  ): Promise<Namespace> {
    return this.kubernetesService.terminateNamespace(namespaceId);
  }

  @Mutation(() => HttpRequestResultOutput)
  @UpdateGuard({
    className: Namespace.name,
    param: NAMESPACE_ID,
  })
  public sendRequestToNamespace(
    @Args(NAMESPACE_ID, { type: () => ID }) namespaceId: MongoID,
    @Args('itemId') itemId: NamespaceItemId,
  ): Promise<HttpRequestResultOutput> {
    return this.kubernetesClient.sendRequest(namespaceId, itemId);
  }

  @Mutation(() => HttpRequestResultOutput)
  @UpdateGuard({
    className: Namespace.name,
    param: NAMESPACE_ID,
  })
  public async resendNamespaceAction(
    @Args(NAMESPACE_ID, { type: () => ID }) namespaceId: MongoID,
    @Args('actionRequestId') actionRequestId: string,
  ): Promise<HttpRequestResultOutput> {
    return this.kubernetesClient.resendAction(namespaceId, actionRequestId);
  }

  @Mutation(() => [DatabaseQueryResultOutput])
  @UpdateGuard({
    className: Namespace.name,
    param: NAMESPACE_ID,
  })
  public sendDbQueryToNamespace(
    @Args(NAMESPACE_ID, { type: () => ID }) namespaceId: MongoID,
    @Args('itemId') itemId: NamespaceItemId,
  ): Promise<DatabaseQueryResultOutput[]> {
    return this.kubernetesClient.sendDbQuery(namespaceId, itemId);
  }

  @Mutation(() => String)
  @UpdateGuard({
    className: Namespace.name,
    param: NAMESPACE_ID,
  })
  public async startNamespaceItem(
    @Args(NAMESPACE_ID, { type: () => ID }) namespaceId: MongoID,
    @Args('itemId') itemId: string,
  ): Promise<string> {
    await this.kubernetesService.startNamespaceItem(namespaceId, itemId);
    return itemId;
  }

  @Mutation(() => String)
  @UpdateGuard({
    className: Namespace.name,
    param: NAMESPACE_ID,
  })
  public async terminateNamespaceItem(
    @Args(NAMESPACE_ID, { type: () => ID }) namespaceId: MongoID,
    @Args('itemId') itemId: string,
  ): Promise<string> {
    await this.kubernetesService.terminateNamespaceItem(namespaceId, itemId);
    return itemId;
  }
}
