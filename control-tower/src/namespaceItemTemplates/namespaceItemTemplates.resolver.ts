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
  NamespaceItemTemplate,
  NamespaceItemType,
  Organization,
} from '#src/mongo/models';
import { NamespaceItemTemplatesService } from '#src/namespaceItemTemplates/namespaceItemTemplates.service';
import { NamespaceItemTemplateInput } from '#src/resolverInputs/namespaceItemTemplateInputs/namespaceItemTemplate.input';
import Ctx from '#src/types/graphql.context.type';
import { MongoID } from '#src/types/mongo.types';

const ORGANIZATION_ID = 'organizationId';
const NAMESPACE_ITEM_TEMPLATE_ID = 'namespaceItemTemplateId';

const returnNamespaceItemTemplate = () => NamespaceItemTemplate;
const returnNamespaceItemTemplateArr = () => [NamespaceItemTemplate];

@UseGuards(
  GqlUserStrategy,
  CreateOperationGuard,
  ReadOperationGuard,
  UpdateOperationGuard,
  DeleteOperationGuard,
)
@Resolver(returnNamespaceItemTemplate)
export class NamespaceItemTemplatesResolver {
  constructor(
    private readonly namespaceItemTemplatesService: NamespaceItemTemplatesService,
  ) {}

  @Query(returnNamespaceItemTemplateArr)
  @ReadGuard({
    className: Organization.name,
    param: ORGANIZATION_ID,
  })
  public userNamespaceItemTemplates(
    @Context() { req }: Ctx,
  ): Promise<Array<NamespaceItemTemplate>> {
    return this.namespaceItemTemplatesService.getUserTemplates(req.user);
  }

  @Query(returnNamespaceItemTemplateArr)
  @ReadGuard({
    className: Organization.name,
    param: ORGANIZATION_ID,
  })
  public namespaceItemTemplates(
    @Args(ORGANIZATION_ID, { type: () => ID })
    organizationId: MongoID,
  ): Promise<Array<NamespaceItemTemplate>> {
    return this.namespaceItemTemplatesService.getNamespaceItemTemplates(
      organizationId,
    );
  }

  @Mutation(returnNamespaceItemTemplate)
  @CreateGuard({ param: ORGANIZATION_ID })
  public createNamespaceItemTemplate(
    @Context() { req }: Ctx,
    @Args(ORGANIZATION_ID, { type: () => ID }) organizationId: MongoID,
    @Args('itemType') itemType: NamespaceItemType,
    @Args('displayName') displayName: string,
  ): Promise<NamespaceItemTemplate> {
    const { email } = req.user;

    return this.namespaceItemTemplatesService.createNamespaceItemTemplate({
      template: {
        itemType,
        displayName,
      },
      permissions: {
        organizationId,
        author: email,
        owner: email,
        memberOverrides: [],
      },
    });
  }

  @Mutation(returnNamespaceItemTemplate)
  @UpdateGuard({
    className: NamespaceItemTemplate.name,
    param: NAMESPACE_ITEM_TEMPLATE_ID,
  })
  public updateNamespaceItemTemplate(
    @Args(NAMESPACE_ITEM_TEMPLATE_ID, { type: () => ID })
    namespaceItemTemplateId: MongoID,
    @Args('namespaceItemTemplate')
    namespaceItemTemplate: NamespaceItemTemplateInput,
  ): Promise<NamespaceItemTemplate> {
    return this.namespaceItemTemplatesService.updateNamespaceItemTemplate(
      namespaceItemTemplateId,
      namespaceItemTemplate,
    );
  }

  @Mutation(returnNamespaceItemTemplate)
  @DeleteGuard({
    className: NamespaceItemTemplate.name,
    param: NAMESPACE_ITEM_TEMPLATE_ID,
  })
  public deleteNamespaceItemTemplate(
    @Args(NAMESPACE_ITEM_TEMPLATE_ID, { type: () => ID })
    namespaceItemTemplateId: MongoID,
  ): Promise<NamespaceItemTemplate> {
    return this.namespaceItemTemplatesService.deleteNamespaceItemTemplate(
      namespaceItemTemplateId,
    );
  }
}
