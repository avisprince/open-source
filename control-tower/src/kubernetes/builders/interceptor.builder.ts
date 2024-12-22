import {
  CoreV1Api,
  V1ReplicationController,
  V1Service,
} from '@kubernetes/client-node';
import { Injectable, Logger } from '@nestjs/common';

import { DOKKIMI } from '#src/constants/environment.constants';
import { INTERCEPTOR_NAME } from '#src/constants/kubernetes.constants';
import { PROXY_SERVICE_NAME } from '#src/constants/route.constants';
import { PodSpecUtil } from '#src/kubernetes/builders/utils/podSpec.util';
import { KubeClientFactory } from '#src/kubernetes/kubeConfig/kubeClient.factory';

@Injectable()
export class InterceptorBuilder {
  private readonly logger = new Logger(InterceptorBuilder.name);

  constructor(private readonly podSpecUtil: PodSpecUtil) {}

  public async build(
    kubeClientFactory: KubeClientFactory,
    namespaceId: string,
    serviceName: string,
    serviceDomain: string,
  ): Promise<{ podResult: V1ReplicationController; serviceResult: V1Service }> {
    const k8sApi = kubeClientFactory.getCoreV1ApiClient();
    const name = `${serviceName}-${INTERCEPTOR_NAME}-${namespaceId}`;

    const [podResult, serviceResult] = await Promise.all([
      this.createInterceptorPod(k8sApi, namespaceId, name, serviceDomain),
      this.createInterceptorService(k8sApi, namespaceId, name),
    ]);

    return {
      podResult,
      serviceResult,
    };
  }

  public async destroy(
    kubeClientFactory: KubeClientFactory,
    namespaceId: string,
    serviceName: string,
  ): Promise<void> {
    const k8sApi = kubeClientFactory.getCoreV1ApiClient();
    const name = `${serviceName}-${INTERCEPTOR_NAME}-${namespaceId}`;

    try {
      await Promise.all([
        k8sApi.deleteNamespacedService(name, namespaceId),
        k8sApi.deleteNamespacedReplicationController(
          name,
          namespaceId,
          null,
          null,
          null,
          null,
          null,
          {
            propagationPolicy: 'Foreground',
          },
        ),
      ]);
    } catch (err) {
      this.logger.error(err.message);
    }
  }

  private async createInterceptorPod(
    k8sApi: CoreV1Api,
    namespaceId: string,
    name: string,
    serviceDomain: string,
  ): Promise<V1ReplicationController> {
    try {
      const result = await k8sApi.createNamespacedReplicationController(
        namespaceId,
        {
          metadata: {
            name,
            namespace: namespaceId,
          },
          spec: {
            replicas: 1,
            selector: {
              app: name,
            },
            template: {
              metadata: {
                labels: {
                  app: name,
                },
              },
              spec: {
                imagePullSecrets: [
                  {
                    name: `${DOKKIMI}-secret-${namespaceId}`,
                  },
                ],
                containers: [
                  {
                    name,
                    image: this.podSpecUtil.imageName(INTERCEPTOR_NAME),
                    imagePullPolicy:
                      process.env.IMAGE_PULL_POLICY || 'IfNotPresent',
                    volumeMounts: this.podSpecUtil.volumeMounts(),
                    env: [
                      {
                        name: 'API_KEY',
                        value: process.env.API_KEY,
                      },
                      {
                        name: 'NAMESPACE',
                        value: namespaceId,
                      },
                      {
                        name: 'CONTROL_TOWER_URI',
                        value: process.env.CONTROL_TOWER_URI,
                      },
                      {
                        name: 'PROXY_SERVICE_URI',
                        value: `http://${PROXY_SERVICE_NAME}-service-${namespaceId}:5001`,
                      },
                      {
                        name: 'ORIGIN',
                        value: name.split('-')[0],
                      },
                      {
                        name: 'ORIGIN_DOMAIN',
                        value: serviceDomain,
                      },
                      {
                        name: 'ACTIVE_REQUESTS_LIMIT',
                        value: '50',
                      },
                      {
                        name: 'BUGSNAG_API_KEY',
                        value: process.env.BUGSNAG_API_KEY,
                      },
                    ],
                    resources: {
                      requests: {
                        memory: '100Mi',
                        cpu: '100m',
                      },
                      limits: {
                        memory: '200Mi',
                        cpu: '200m',
                      },
                    },
                  },
                ],
                volumes: this.podSpecUtil.volumes(),
              },
            },
          },
        },
      );

      return result.body;
    } catch (e) {
      this.logger.error(e.message);
    }
  }

  private async createInterceptorService(
    k8sApi: CoreV1Api,
    namespaceId: string,
    name: string,
  ): Promise<V1Service> {
    try {
      const result = await k8sApi.createNamespacedService(namespaceId, {
        apiVersion: 'v1',
        kind: 'Service',
        metadata: {
          name,
          namespace: namespaceId,
        },
        spec: {
          selector: {
            app: name,
          },
          ports: [
            {
              name,
              protocol: 'TCP',
              port: 80,
            },
          ],
        },
      });

      return result.body;
    } catch (e) {
      this.logger.error(e.message);
    }
  }
}
