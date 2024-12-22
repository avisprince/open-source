import {
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
} from '@nestjs/common';

import { CRUDGuard } from '#src/auth/authorization/crud.guard';
import { OrganizationRoles } from '#src/constants/roles.constants';

const CREATE_GUARD_KEY = 'create_guard_key';
type CreateGuardMetadata = {
  param: string;
};

export const CreateGuard = (metadata: CreateGuardMetadata) =>
  SetMetadata(CREATE_GUARD_KEY, metadata);

@Injectable()
export class CreateOperationGuard extends CRUDGuard implements CanActivate {
  public async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const { user, args, metadata } = this.parseContext<CreateGuardMetadata>(
      ctx,
      CREATE_GUARD_KEY,
    );

    if (!metadata) {
      return true;
    }

    return this.isUserInOrganization(
      args[metadata.param],
      user.email,
      OrganizationRoles.USER,
    );
  }
}
