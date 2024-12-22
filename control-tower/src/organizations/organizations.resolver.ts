import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CreateOperationGuard } from '#src/auth/authorization/create.guard';
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
import { Organization } from '#src/mongo/models';
import { returnNamespace } from '#src/namespaces/namespaces.resolver';
import { OrganizationsService } from '#src/organizations/organizations.service';
import { OrganizationInput } from '#src/resolverInputs/organization.input';
import { MongoID } from '#src/types/mongo.types';

const ORGANIZATION_ID = 'organizationId';

export const returnOrg = () => Organization;

@UseGuards(
  GqlUserStrategy,
  CreateOperationGuard,
  ReadOperationGuard,
  UpdateOperationGuard,
  DeleteOperationGuard,
)
@Resolver(returnNamespace)
export class OrganizationsResolver {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Query(returnOrg)
  @ReadGuard({
    className: Organization.name,
    param: ORGANIZATION_ID,
  })
  public organization(
    @Args(ORGANIZATION_ID, { type: () => ID }) organizationId: MongoID,
  ): Promise<Organization> {
    return this.organizationsService.getOrganizationById(organizationId);
  }

  @Mutation(returnOrg)
  @UpdateGuard({
    className: Organization.name,
    param: ORGANIZATION_ID,
  })
  public updateOrganization(
    @Args(ORGANIZATION_ID, { type: () => ID }) organizationId: MongoID,
    @Args('organization', { type: () => OrganizationInput })
    organization: OrganizationInput,
  ): Promise<Organization> {
    return this.organizationsService.updateOrganization(
      organizationId,
      organization,
    );
  }

  @Mutation(returnOrg)
  public createOrganization(
    @Args('name') name: string,
    @Args('creatorEmail') creatorEmail: string,
  ): Promise<Organization> {
    return this.organizationsService.createOrganization(name, creatorEmail);
  }

  @Mutation(returnOrg)
  @UpdateGuard({
    className: Organization.name,
    param: ORGANIZATION_ID,
  })
  public addMember(
    @Args(ORGANIZATION_ID, { type: () => ID }) organizationId: MongoID,
    @Args('email') email: string,
  ): Promise<Organization> {
    return this.organizationsService.addMember(organizationId, email);
  }

  @Mutation(returnOrg)
  @UpdateGuard({
    className: Organization.name,
    param: ORGANIZATION_ID,
  })
  public removeMember(
    @Args(ORGANIZATION_ID, { type: () => ID }) organizationId: MongoID,
    @Args('email') email: string,
  ): Promise<Organization> {
    return this.organizationsService.removeMember(organizationId, email);
  }

  @Mutation(returnOrg)
  @DeleteGuard({
    className: Organization.name,
    param: ORGANIZATION_ID,
  })
  public deleteOrganization(
    @Args(ORGANIZATION_ID, { type: () => ID }) organizationId: MongoID,
  ): Promise<Organization> {
    return this.organizationsService.deleteOrganization(organizationId);
  }
}
