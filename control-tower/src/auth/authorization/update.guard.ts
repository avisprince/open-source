import {
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
} from '@nestjs/common';

import { CRUDGuard } from '#src/auth/authorization/crud.guard';
import {
  EditPermissions,
  OrganizationRoles,
} from '#src/constants/roles.constants';
import { Organization, Permissions, User } from '#src/mongo/models';

const UPDATE_GUARD_KEY = 'update_guard_key';
type UpdateGuardMetadata = {
  className: string;
  param: string;
};

export const UpdateGuard = (metadata: UpdateGuardMetadata) =>
  SetMetadata(UPDATE_GUARD_KEY, metadata);

@Injectable()
export class UpdateOperationGuard extends CRUDGuard implements CanActivate {
  public async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const { user, args, metadata } = this.parseContext<UpdateGuardMetadata>(
      ctx,
      UPDATE_GUARD_KEY,
    );

    if (!metadata) {
      return true;
    }

    if (metadata.className === Organization.name) {
      return this.isUserInOrganization(
        args[metadata.param],
        user.email,
        OrganizationRoles.ADMIN,
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
      permissions.memberOverrides.some(
        member =>
          member.email === user.email &&
          (member.editPermissions === EditPermissions.ADMIN ||
            member.editPermissions === EditPermissions.READ_WRITE),
      )
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
