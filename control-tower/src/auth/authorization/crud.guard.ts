import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';

import { OrganizationRoles } from '#src/constants/roles.constants';
import {
  DockerRegistrySecret,
  HasPermissions,
  Namespace,
  NamespaceItemTemplate,
  Permissions,
  TestSuite,
  Upload,
  User,
} from '#src/mongo/models';
import {
  DockerRegistrySecretsRepository,
  NamespaceItemTemplatesRepository,
  NamespacesRepository,
  OrganizationsRepository,
  TestSuitesRepository,
  UploadsRepository,
} from '#src/mongo/repositories';
import { MongoID } from '#src/types/mongo.types';

@Injectable()
export abstract class CRUDGuard {
  constructor(
    private readonly reflector: Reflector,
    private readonly organizationsRepository: OrganizationsRepository,
    private readonly namespacesRepository: NamespacesRepository,
    private readonly namespaceItemTemplatesRepository: NamespaceItemTemplatesRepository,
    private readonly testSuitesRepository: TestSuitesRepository,
    private readonly uploadsRepository: UploadsRepository,
    private readonly dockerRegistrySecretsRepository: DockerRegistrySecretsRepository,
  ) {}

  public parseContext<T>(
    ctx: ExecutionContext,
    guardKey: string,
  ): {
    user: User;
    args: any;
    metadata: T;
  } {
    const context = GqlExecutionContext.create(ctx);
    const request = context.getContext().req;
    const args = context.getArgs();

    const metadata = this.reflector.getAllAndOverride<T>(guardKey, [
      context.getHandler(),
      context.getClass(),
    ]);

    return {
      user: request.user,
      args,
      metadata,
    };
  }

  public async isUserInOrganization(
    orgId: MongoID | string,
    email: string,
    targetRole: OrganizationRoles,
  ): Promise<boolean> {
    const organization = await this.organizationsRepository.findById(orgId);
    if (!organization) {
      return false;
    }

    // If the user is a member of the current organization with a valid role, we're done
    const member = organization.members.find(member => member.email === email);
    if (!!member && this.userHasValidRole(member.role, targetRole)) {
      return true;
    }

    // If the organization has a parent, recursively check the parent organization
    if (organization.parentOrganization) {
      return this.isUserInOrganization(
        organization.parentOrganization,
        email,
        OrganizationRoles.ADMIN,
      );
    }

    // If the organization has no parent and the user isn't a member, return false
    return false;
  }

  public async getPermissions(
    className: string,
    id: string,
  ): Promise<Permissions | null> {
    const hasPermissions = await this.getHasPermissions(className, id);
    return !!hasPermissions ? hasPermissions.permissions : null;
  }

  private getHasPermissions(
    className: string,
    id: string,
  ): Promise<HasPermissions> {
    switch (className) {
      case Namespace.name: {
        return this.namespacesRepository.findById(id);
      }
      case TestSuite.name: {
        return this.testSuitesRepository.findById(id);
      }
      case DockerRegistrySecret.name: {
        return this.dockerRegistrySecretsRepository.findById(id);
      }
      case Upload.name: {
        return this.uploadsRepository.findById(id);
      }
      case NamespaceItemTemplate.name: {
        return this.namespaceItemTemplatesRepository.findById(id);
      }
      default: {
        return null;
      }
    }
  }

  private userHasValidRole(
    userRole: OrganizationRoles,
    targetOrgRole: OrganizationRoles,
  ): boolean {
    switch (userRole) {
      case OrganizationRoles.OWNER:
      case OrganizationRoles.ADMIN: {
        return true;
      }
      case OrganizationRoles.USER: {
        return targetOrgRole === OrganizationRoles.USER;
      }
      default: {
        return false;
      }
    }
  }
}
