import {
  CoreV1Api,
  V1ReplicationController,
  V1Service,
} from '@kubernetes/client-node';
import { Injectable, Logger } from '@nestjs/common';

import { KubeClientFactory } from '#src/kubernetes/kubeConfig/kubeClient.factory';
import { Namespace } from '#src/mongo/models';

@Injectable()
export class DnsMasqBuilder {
  private readonly logger = new Logger(DnsMasqBuilder.name);

  public async build(
    kubeClientFactory: KubeClientFactory,
    namespace: Namespace,
    serviceName: string,
    interceptorIP: string,
  ): Promise<{ podResult: V1ReplicationController; serviceResult: V1Service }> {
    const k8sApi = kubeClientFactory.getCoreV1ApiClient();

    const [, podResult, serviceResult] = await Promise.all([
      this.createDnsmasqConf(k8sApi, namespace, serviceName, interceptorIP),
      this.createPod(k8sApi, namespace, serviceName, interceptorIP),
      this.createService(k8sApi, namespace, serviceName),
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
    const podName = `${serviceName}-dns-pod-${namespaceId}`;

    try {
      await Promise.all([
        k8sApi.deleteNamespacedConfigMap(
          this.getConfigName(serviceName),
          namespaceId,
        ),
        k8sApi.deleteNamespacedService(
          `${serviceName}-dns-service-${namespaceId}`,
          namespaceId,
        ),
        k8sApi.deleteNamespacedReplicationController(
          podName,
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
    } catch (e) {
      this.logger.error(e.response.body);
      this.logger.error(e.message);
    }
  }

  private async createDnsmasqConf(
    k8sApi: CoreV1Api,
    namespace: Namespace,
    serviceName: string,
    interceptorIP: string,
  ): Promise<void> {
    try {
      await k8sApi.createNamespacedConfigMap(namespace.id.toString(), {
        metadata: {
          name: this.getConfigName(serviceName),
        },
        data: {
          'dnsmasq.conf': `
            address=/#/${interceptorIP}
          `,
        },
      });
    } catch (e) {
      this.logger.error(e.message);
    }
  }

  private async createPod(
    k8sApi: CoreV1Api,
    namespace: Namespace,
    serviceName: string,
    interceptorIP: string,
  ): Promise<V1ReplicationController> {
    const namespaceId = namespace.id.toString();
    const podName = `${serviceName}-dns-pod-${namespaceId}`;

    try {
      const result = await k8sApi.createNamespacedReplicationController(
        namespaceId,
        {
          metadata: {
            name: podName,
            namespace: namespaceId,
          },
          spec: {
            replicas: 1,
            selector: {
              app: podName,
            },
            template: {
              metadata: {
                labels: {
                  app: podName,
                },
              },
              spec: {
                containers: [
                  {
                    name: podName,
                    imagePullPolicy:
                      process.env.IMAGE_PULL_POLICY || 'IfNotPresent',
                    image: 'strm/dnsmasq:latest',
                    args: [
                      '--no-daemon',
                      '--no-resolv',
                      `--address=/*/${interceptorIP}`,
                    ],
                    volumeMounts: [
                      {
                        name: this.getConfigName(serviceName),
                        mountPath: '/etc/dnsmasq.d',
                      },
                    ],
                  },
                ],
                volumes: [
                  {
                    name: this.getConfigName(serviceName),
                    configMap: {
                      name: this.getConfigName(serviceName),
                    },
                  },
                ],
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

  private async createService(
    k8sApi: CoreV1Api,
    namespace: Namespace,
    serviceName: string,
  ): Promise<V1Service> {
    const namespaceId = namespace.id.toString();
    const podName = `${serviceName}-dns-pod-${namespaceId}`;

    try {
      const result = await k8sApi.createNamespacedService(namespaceId, {
        apiVersion: 'v1',
        kind: 'Service',
        metadata: {
          name: `${serviceName}-dns-service-${namespaceId}`,
          namespace: namespaceId,
        },
        spec: {
          selector: {
            app: podName,
          },
          ports: [
            {
              protocol: 'UDP',
              port: 53,
            },
          ],
        },
      });

      return result.body;
    } catch (e) {
      this.logger.error(e.message);
      throw e;
    }
  }

  private getConfigName(serviceName: string) {
    return `${serviceName}-dnsmasq-config`;
  }
}
