import { CoreV1Api } from '@kubernetes/client-node';
import { Injectable, Logger } from '@nestjs/common';

import { DnsMasqBuilder } from '#src/kubernetes/builders/dnsmasq.builder';
import { InterceptorBuilder } from '#src/kubernetes/builders/interceptor.builder';
import { SecretsBuilder } from '#src/kubernetes/builders/secrets.builder';
import { KubeClientFactory } from '#src/kubernetes/kubeConfig/kubeClient.factory';
import {
  defaultMaxUsage,
  defaultMinUsage,
  Namespace,
  Service,
} from '#src/mongo/models';
import { MongoID } from '#src/types/mongo.types';

@Injectable()
export class PodBuilder {
  private readonly logger = new Logger(PodBuilder.name);

  constructor(
    private readonly interceptorBuilder: InterceptorBuilder,
    private readonly dnsmasqBuilder: DnsMasqBuilder,
    private readonly secretsBuilder: SecretsBuilder,
  ) {}

  public async build(
    kubeClientFactory: KubeClientFactory,
    namespace: Namespace,
    service: Service,
  ): Promise<void> {
    try {
      const k8sApi = kubeClientFactory.getCoreV1ApiClient();

      if (service.dockerRegistrySecret) {
        await this.secretsBuilder.build(
          kubeClientFactory,
          namespace.id,
          service.itemId,
          service.dockerRegistrySecret,
        );
      }

      const interceptorResult = await this.interceptorBuilder.build(
        kubeClientFactory,
        namespace.id.toString(),
        service.itemId,
        service.domain,
      );
      const interceptorIP = interceptorResult.serviceResult.spec.clusterIP;
      const dnsmasqResult = await this.dnsmasqBuilder.build(
        kubeClientFactory,
        namespace,
        service.itemId,
        interceptorIP,
      );
      const dnsmasqIP = dnsmasqResult.serviceResult.spec.clusterIP;

      await Promise.all([
        this.createPod(k8sApi, namespace, service, dnsmasqIP),
        this.createService(k8sApi, namespace.id.toString(), service),
      ]);
    } catch (err) {
      this.logger.error(err);
    }
  }

  public async destroy(
    kubeClientFactory: KubeClientFactory,
    namespace: MongoID,
    service: Service,
  ): Promise<void> {
    const namespaceId = namespace.toString();
    const k8sApi = kubeClientFactory.getCoreV1ApiClient();
    const podName = `${service.itemId}-pod-${namespaceId}`;

    try {
      if (service.dockerRegistrySecret) {
        await this.secretsBuilder.destroy(
          kubeClientFactory,
          namespace,
          service.itemId,
        );
      }

      await Promise.all([
        this.interceptorBuilder.destroy(
          kubeClientFactory,
          namespaceId,
          service.itemId,
        ),
        this.dnsmasqBuilder.destroy(
          kubeClientFactory,
          namespaceId,
          service.itemId,
        ),
        k8sApi.deleteNamespacedService(
          `${service.itemId}-service-${namespaceId}`,
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
    } catch (err) {
      this.logger.error(err.message);
      throw err;
    }
  }

  private async createPod(
    k8sApi: CoreV1Api,
    namespace: Namespace,
    service: Service,
    dnsmasqIP: string,
  ): Promise<void> {
    const namespaceId = namespace.id.toString();
    const { itemId, image, env, minResources, maxResources } = service;
    const podName = `${itemId}-pod-${namespaceId}`;
    const secret = service.dockerRegistrySecret?.id;

    const result = await k8sApi.listNamespacedService(namespaceId);
    const hostAliases = result.body.items
      .filter(item => item.metadata.name.includes('-db-service'))
      .map(item => ({
        ip: item.spec.clusterIP,
        hostnames: [item.metadata.name],
      }));

    try {
      await k8sApi.createNamespacedReplicationController(namespaceId, {
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
              imagePullSecrets: !!secret
                ? [
                    {
                      name: `${itemId}-secret-${namespaceId}`,
                    },
                  ]
                : [],
              containers: [
                {
                  name: podName,
                  imagePullPolicy:
                    process.env.IMAGE_PULL_POLICY || 'IfNotPresent',
                  image,
                  env: (env || []).filter(
                    ({ name, value }) => !!name && !!value,
                  ),
                  readinessProbe: service.healthCheck
                    ? {
                        httpGet: {
                          path: service.healthCheck,
                          port: service.port,
                        },
                        initialDelaySeconds: 5,
                        periodSeconds: 5,
                      }
                    : undefined,
                  resources: {
                    requests: {
                      memory: `${
                        minResources?.memory || defaultMinUsage.memory
                      }Mi`,
                      cpu: `${minResources?.cpu || defaultMinUsage.cpu}m`,
                    },
                    limits: {
                      memory: `${
                        maxResources?.memory || defaultMaxUsage.memory
                      }Mi`,
                      cpu: `${maxResources?.cpu || defaultMaxUsage.cpu}m`,
                    },
                  },
                },
              ],
              dnsPolicy: 'None',
              dnsConfig: {
                nameservers: [dnsmasqIP],
              },
              hostAliases,
            },
          },
        },
      });
    } catch (err) {
      this.logger.error(err);
    }
  }

  private async createService(
    k8sApi: CoreV1Api,
    namespace: string,
    service: Service,
  ): Promise<void> {
    const { itemId, port } = service;
    const podName = `${itemId}-pod-${namespace}`;

    try {
      await k8sApi.createNamespacedService(namespace, {
        apiVersion: 'v1',
        kind: 'Service',
        metadata: {
          name: `${itemId}-service-${namespace}`,
          namespace,
        },
        spec: {
          selector: {
            app: podName,
          },
          ports: [
            {
              protocol: 'TCP',
              port,
            },
          ],
        },
      });
    } catch (err) {
      this.logger.error(err);
    }
  }
}
