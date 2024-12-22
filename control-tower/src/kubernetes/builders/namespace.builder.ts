import { Injectable, Logger } from '@nestjs/common';

import { KubeClientFactory } from '#src/kubernetes/kubeConfig/kubeClient.factory';
import { MongoID } from '#src/types/mongo.types';

@Injectable()
export class NamespaceBuilder {
  private readonly logger = new Logger(NamespaceBuilder.name);

  public async build(
    kubeClientFactory: KubeClientFactory,
    namespace: MongoID,
  ): Promise<void> {
    const k8sApi = kubeClientFactory.getCoreV1ApiClient();

    try {
      await k8sApi.createNamespace({
        metadata: {
          name: namespace.toString(),
        },
      });
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  public async destroy(
    kubeClientFactory: KubeClientFactory,
    namespace: MongoID,
  ): Promise<void> {
    const k8sApi = kubeClientFactory.getCoreV1ApiClient();

    try {
      await k8sApi.deleteNamespace(namespace.toString());
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }
}
