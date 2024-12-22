import { V1HTTPIngressPath } from '@kubernetes/client-node';
import { Injectable, Logger } from '@nestjs/common';

import { CLUSTER_DOMAIN } from '#src/app.contants';
import { DOKKIMI } from '#src/constants/environment.constants';
import { INTERCEPTOR_NAME } from '#src/constants/kubernetes.constants';
import {
  DB_PROXY_ENDPOINT,
  INTERCEPTOR_PROXY_ENDPOINT,
  PROXY_SERVICE_NAME,
} from '#src/constants/route.constants';
import { KubeClientFactory } from '#src/kubernetes/kubeConfig/kubeClient.factory';
import { Namespace } from '#src/mongo/models';
import { MongoID } from '#src/types/mongo.types';

@Injectable()
export class IngressBuilder {
  private readonly logger = new Logger(IngressBuilder.name);

  public async build(
    kubeClientFactory: KubeClientFactory,
    namespace: Namespace,
  ): Promise<void> {
    const namespaceId = namespace.id.toString();
    const k8sApi = kubeClientFactory.getNetworkingV1ApiClient();

    const proxyServicePaths = [
      DB_PROXY_ENDPOINT,
      INTERCEPTOR_PROXY_ENDPOINT,
    ].map(endpoint =>
      this.getServicePath(
        `/${PROXY_SERVICE_NAME}/${endpoint}/${namespaceId}`,
        `${PROXY_SERVICE_NAME}-service-${namespaceId}`,
        5001,
      ),
    );

    const servicesPath = this.getServicePath(
      `/${namespaceId}`,
      `${DOKKIMI}-${INTERCEPTOR_NAME}-${namespaceId}`,
      80,
    );

    try {
      await k8sApi.createNamespacedIngress(namespaceId, {
        metadata: {
          name: `ingress-${DOKKIMI}-${namespaceId}`,
          namespace: namespaceId,
          annotations: {
            'kubernetes.io/ingress.class': 'nginx',
            // 'cert-manager.io/cluster-issuer': 'letsencrypt-prod',
          },
        },
        spec: {
          rules: [
            {
              host: CLUSTER_DOMAIN,
              http: {
                paths: [servicesPath, ...proxyServicePaths],
              },
            },
          ],
        },
      });
    } catch (e) {
      this.logger.error('Error starting ingress');
      this.logger.error(e.message);
    }
  }

  public async destroy(
    kubeClientFactory: KubeClientFactory,
    namespace: MongoID,
  ): Promise<void> {
    const k8sApi = kubeClientFactory.getNetworkingV1ApiClient();
    const namespaceId = namespace.toString();

    try {
      await k8sApi.deleteNamespacedIngress(
        `ingress-${DOKKIMI}-${namespaceId}`,
        namespaceId,
      );
    } catch (e) {
      this.logger.error(`Failed to destroy ingress for namespace ${namespace}`);
      this.logger.error(e.message);
    }
  }

  private getServicePath(
    path: string,
    name: string,
    port: number,
  ): V1HTTPIngressPath {
    return {
      path,
      pathType: 'Prefix',
      backend: {
        service: {
          name,
          port: {
            number: port,
          },
        },
      },
    };
  }
}
