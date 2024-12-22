import { Module } from '@nestjs/common';

import { ActionLoggerController } from '#src/actionLogger/actionLogger.controller';
import { ActionLoggerService } from '#src/actionLogger/actionLogger.service';
import { KubernetesModule } from '#src/kubernetes/kubernetes.module';
import { NamespacesModule } from '#src/namespaces/namespaces.module';

@Module({
  imports: [KubernetesModule, NamespacesModule],
  providers: [ActionLoggerService],
  controllers: [ActionLoggerController],
  exports: [ActionLoggerService],
})
export class ActionLoggerModule {}
