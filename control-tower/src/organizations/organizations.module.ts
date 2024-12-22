import { Module } from '@nestjs/common';

import { OrganizationsResolver } from '#src/organizations/organizations.resolver';
import { OrganizationsService } from '#src/organizations/organizations.service';

@Module({
  providers: [OrganizationsResolver, OrganizationsService],
  exports: [OrganizationsService],
})
export class OrganizationsModule {}
