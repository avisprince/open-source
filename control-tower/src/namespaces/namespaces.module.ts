import { Module } from '@nestjs/common';

import { KubernetesModule } from '#src/kubernetes/kubernetes.module';
import { NamespaceItemTemplatesModule } from '#src/namespaceItemTemplates/namespaceItemTemplates.module';
import { NamespacesResolver } from '#src/namespaces/namespaces.resolver';
import { NamespacesService } from '#src/namespaces/namespaces.service';

@Module({
  imports: [KubernetesModule, NamespaceItemTemplatesModule],
  providers: [NamespacesResolver, NamespacesService],
  exports: [NamespacesService],
})
export class NamespacesModule {}
