import {
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
} from '@nestjs/common';

import { CRUDGuard } from '#src/auth/authorization/crud.guard';
import { OrganizationRoles } from '#src/constants/roles.constants';
import { Organization, Permissions, User } from '#src/mongo/models';

const READ_GUARD_KEY = 'read_guard_key';
type ReadGuardMetadata = {
  className: string;
  param: string;
};

export const ReadGuard = (metadata: ReadGuardMetadata) =>
  SetMetadata(READ_GUARD_KEY, metadata);

@Injectable()
export class ReadOperationGuard extends CRUDGuard implements CanActivate {
  public async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const { user, args, metadata } = this.parseContext<ReadGuardMetadata>(
      ctx,
      READ_GUARD_KEY,
    );

    if (!metadata) {
      return true;
    }

    if (metadata.className === Organization.name) {
      return this.isUserInOrganization(
        args[metadata.param],
        user.email,
        OrganizationRoles.USER,
      );
    }

    const permissions = await this.getPermissions(
      metadata.className,
      args[metadata.param],
    );

    if (!permissions) {
      return false;
    }

    return this.authorizeRequest(user, permissions);
  }

  private async authorizeRequest(
    user: User,
    permissions: Permissions,
  ): Promise<boolean> {
    if (permissions.owner === user.email) {
      return true;
    }

    if (
      permissions.memberOverrides.some(member => member.email === user.email)
    ) {
      return true;
    }

    return this.isUserInOrganization(
      permissions.organizationId,
      user.email,
      OrganizationRoles.ADMIN,
    );
  }
}
