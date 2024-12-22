import { Module } from '@nestjs/common';

import { NamespaceItemTemplatesResolver } from '#src/namespaceItemTemplates/namespaceItemTemplates.resolver';
import { NamespaceItemTemplatesService } from '#src/namespaceItemTemplates/namespaceItemTemplates.service';

@Module({
  providers: [NamespaceItemTemplatesResolver, NamespaceItemTemplatesService],
  exports: [NamespaceItemTemplatesService],
})
export class NamespaceItemTemplatesModule {}
