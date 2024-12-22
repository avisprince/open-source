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
import {
  Namespace,
  NamespaceItem,
  NamespaceItemTemplate,
  NamespaceType,
  Organization,
} from '#src/mongo/models';
import { NamespacesService } from '#src/namespaces/namespaces.service';
import { CanvasInfoInput } from '#src/resolverInputs/namespaceItemInputs/canvasInfo.input';
import {
  NamespaceInput,
  NamespaceItemInput,
  NamespaceItemPositionInput,
  NewNamespaceItemInput,
} from '#src/resolverInputs/namespaces.input';
import { TestCaseInput } from '#src/resolverInputs/testCase.input';
import Ctx from '#src/types/graphql.context.type';
import { MongoID } from '#src/types/mongo.types';

const ORGANIZATION_ID = 'organizationId';
const NAMESPACE_ID = 'namespaceId';

export const returnNamespace = () => Namespace;
export const returnNamespaceItem = () => NamespaceItem;
export const returnNamespaceArray = () => [Namespace];
export const returnNamespaceItemArray = () => [NamespaceItem];

@UseGuards(
  GqlUserStrategy,
  CreateOperationGuard,
  ReadOperationGuard,
  UpdateOperationGuard,
  DeleteOperationGuard,
)
@Resolver(returnNamespace)
export class NamespacesResolver {
  constructor(private readonly namespaceService: NamespacesService) {}

  @Query(returnNamespace)
  @ReadGuard({
    className: Namespace.name,
    param: NAMESPACE_ID,
  })
  public namespace(
    @Args(NAMESPACE_ID, { type: () => ID }) namespaceId: MongoID,
  ): Promise<Namespace> {
    return this.namespaceService.getNamespace(namespaceId);
  }

  @Query(returnNamespaceArray)
  @ReadGuard({
    className: Organization.name,
    param: ORGANIZATION_ID,
  })
  public namespaces(
    @Args(ORGANIZATION_ID, { type: () => ID }) organizationId: MongoID,
    @Args('type', { type: () => String }) type: NamespaceType,
  ): Promise<Namespace[]> {
    return this.namespaceService.getNamespaces(organizationId, type);
  }

  @Query(returnNamespaceArray)
  public userNamespaces(@Context() { req }: Ctx): Promise<Namespace[]> {
    return this.namespaceService.getUserNamespaces(req.user);
  }

  @Mutation(returnNamespace)
  @CreateGuard({ param: ORGANIZATION_ID })
  public createNamespace(
    @Context() { req }: Ctx,
    @Args(ORGANIZATION_ID, { type: () => ID }) organizationId: MongoID,
    @Args('namespace') namespace: NamespaceInput,
  ): Promise<Namespace> {
    const { email } = req.user;

    return this.namespaceService.createNamespace({
      name: namespace.name,
      type: namespace.type,
      permissions: {
        organizationId,
        author: email,
        owner: email,
        memberOverrides: [],
      },
    });
  }

  @Mutation(returnNamespace)
  @CreateGuard({ param: ORGANIZATION_ID })
  @ReadGuard({
    className: Namespace.name,
    param: NAMESPACE_ID,
  })
  public duplicateNamespace(
    @Context() { req }: Ctx,
    @Args(ORGANIZATION_ID, { type: () => ID }) organizationId: MongoID,
    @Args(NAMESPACE_ID, { type: () => ID }) namespaceId: MongoID,
  ): Promise<Namespace> {
    return this.namespaceService.duplicateNamespace(
      namespaceId,
      organizationId,
      req.user,
    );
  }

  @Mutation(returnNamespace)
  @UpdateGuard({
    className: Namespace.name,
    param: NAMESPACE_ID,
  })
  public updateNamespace(
    @Args(NAMESPACE_ID, { type: () => ID }) namespaceId: MongoID,
    @Args('namespace') namespace: NamespaceInput,
  ): Promise<Namespace> {
    return this.namespaceService.updateNamespace(namespaceId, namespace);
  }

  @Mutation(returnNamespaceItem)
  @UpdateGuard({
    className: Namespace.name,
    param: NAMESPACE_ID,
  })
  public addItemToNamespace(
    @Args(NAMESPACE_ID, { type: () => ID }) namespaceId: MongoID,
    @Args('item') item: NewNamespaceItemInput,
  ): Promise<NamespaceItem> {
    return this.namespaceService.addItem(namespaceId, item);
  }

  @Mutation(returnNamespaceItem)
  @UpdateGuard({
    className: Namespace.name,
    param: NAMESPACE_ID,
  })
  public duplicateNamespaceItem(
    @Args(NAMESPACE_ID, { type: () => ID }) namespaceId: MongoID,
    @Args('itemId') itemId: string,
    @Args('posX') posX: number,
    @Args('posY') posY: number,
  ): Promise<NamespaceItem> {
    return this.namespaceService.duplicateItem(namespaceId, itemId, posX, posY);
  }

  @Mutation(returnNamespaceItem)
  @UpdateGuard({
    className: Namespace.name,
    param: NAMESPACE_ID,
  })
  @ReadGuard({
    className: NamespaceItemTemplate.name,
    param: 'templateId',
  })
  public addTemplateToNamespace(
    @Args(NAMESPACE_ID, { type: () => ID }) namespaceId: MongoID,
    @Args('templateId', { type: () => ID }) templateId: MongoID,
    @Args('canvasInfo') canvasInfo: CanvasInfoInput,
  ): Promise<NamespaceItem> {
    return this.namespaceService.addTemplateToNamespace(
      namespaceId,
      templateId,
      canvasInfo,
    );
  }

  @Mutation(returnNamespaceItem)
  @UpdateGuard({
    className: Namespace.name,
    param: NAMESPACE_ID,
  })
  public updateItemInNamespace(
    @Args(NAMESPACE_ID, { type: () => ID }) namespaceId: MongoID,
    @Args('item') item: NamespaceItemInput,
  ): Promise<NamespaceItem> {
    return this.namespaceService.updateItem(namespaceId, item);
  }

  @Mutation(returnNamespaceItem)
  @UpdateGuard({
    className: Namespace.name,
    param: NAMESPACE_ID,
  })
  public updateItemPositionInNamespace(
    @Args(NAMESPACE_ID, { type: () => ID }) namespaceId: MongoID,
    @Args('itemPosition') itemPosition: NamespaceItemPositionInput,
  ): Promise<NamespaceItem> {
    return this.namespaceService.updateItemPosition(namespaceId, itemPosition);
  }

  @Mutation(returnNamespaceItemArray)
  @UpdateGuard({
    className: Namespace.name,
    param: NAMESPACE_ID,
  })
  public deleteItemFromNamespace(
    @Args(NAMESPACE_ID, { type: () => ID }) namespaceId: MongoID,
    @Args('itemId') itemId: string,
  ): Promise<NamespaceItem[]> {
    return this.namespaceService.deleteItem(namespaceId, itemId);
  }

  @Mutation(returnNamespace)
  @DeleteGuard({
    className: Namespace.name,
    param: NAMESPACE_ID,
  })
  public deleteNamespace(
    @Args(NAMESPACE_ID, { type: () => ID }) namespaceId: MongoID,
  ): Promise<Namespace> {
    return this.namespaceService.deleteNamespace(namespaceId);
  }

  @Mutation(() => NamespaceItemTemplate)
  @UpdateGuard({
    className: Namespace.name,
    param: NAMESPACE_ID,
  })
  public async saveItemAsTemplate(
    @Args(NAMESPACE_ID, { type: () => ID }) namespaceId: MongoID,
    @Args('itemId') itemId: string,
  ): Promise<NamespaceItemTemplate> {
    return this.namespaceService.saveItemAsTemplate(namespaceId, itemId);
  }

  @Mutation(() => Boolean)
  @ReadGuard({
    className: Namespace.name,
    param: NAMESPACE_ID,
  })
  public async activeUserHeartbeat(
    @Args(NAMESPACE_ID, { type: () => ID }) namespaceId: MongoID,
    @Args('peerId') peerId: string,
  ) {
    await this.namespaceService.handleActiveUserHeartbeat(namespaceId, peerId);
    return true;
  }

  @Mutation(returnNamespace)
  @UpdateGuard({
    className: Namespace.name,
    param: NAMESPACE_ID,
  })
  public clearNamespaceTraffic(
    @Args(NAMESPACE_ID, { type: () => ID }) namespaceId: MongoID,
  ): Promise<Namespace> {
    return this.namespaceService.clearNamespaceTraffic(namespaceId);
  }

  @Mutation(returnNamespace)
  @UpdateGuard({
    className: Namespace.name,
    param: NAMESPACE_ID,
  })
  public createTestCase(
    @Args(NAMESPACE_ID, { type: () => ID }) namespaceId: MongoID,
    @Args('testCase', { type: () => TestCaseInput }) testCase: TestCaseInput,
  ): Promise<Namespace> {
    return this.namespaceService.createTestCase(namespaceId, testCase);
  }

  @Mutation(returnNamespace)
  @UpdateGuard({
    className: Namespace.name,
    param: NAMESPACE_ID,
  })
  public updateTestCase(
    @Args(NAMESPACE_ID, { type: () => ID }) namespaceId: MongoID,
    @Args('testCase', { type: () => TestCaseInput }) testCase: TestCaseInput,
  ): Promise<Namespace> {
    return this.namespaceService.updateTestCase(namespaceId, testCase);
  }

  @Mutation(returnNamespace)
  @UpdateGuard({
    className: Namespace.name,
    param: NAMESPACE_ID,
  })
  public updateTestOrder(
    @Args(NAMESPACE_ID, { type: () => ID }) namespaceId: MongoID,
    @Args('testCaseIds', { type: () => [String] }) testCaseIds: string[],
  ): Promise<Namespace> {
    return this.namespaceService.updateTestOrder(namespaceId, testCaseIds);
  }

  @Mutation(returnNamespace)
  @UpdateGuard({
    className: Namespace.name,
    param: NAMESPACE_ID,
  })
  public deleteTestCase(
    @Args(NAMESPACE_ID, { type: () => ID }) namespaceId: MongoID,
    @Args('testCaseId') testCaseId: string,
  ): Promise<Namespace> {
    return this.namespaceService.deleteTestCase(namespaceId, testCaseId);
  }
}
