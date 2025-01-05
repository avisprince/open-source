import { CoreV1Api, RbacAuthorizationV1Api } from '@kubernetes/client-node';
import { Injectable, Logger } from '@nestjs/common';

import { DOKKIMI_LOCAL_FILES } from '#src/app.contants';
import { DOKKIMI } from '#src/constants/environment.constants';
import { PROXY_SERVICE_NAME } from '#src/constants/route.constants';
import { calculateUrlMap } from '#src/kubernetes/builders/utils/kubernetes.util';
import { PodSpecUtil } from '#src/kubernetes/builders/utils/podSpec.util';
import { KubeClientFactory } from '#src/kubernetes/kubeConfig/kubeClient.factory';
import { Namespace } from '#src/mongo/models';
import { DB_PORTS, DB_USERS } from '#src/types/database.types';
import { MongoID } from '#src/types/mongo.types';

@Injectable()
export class ProxyServiceBuilder {
  private readonly logger = new Logger(ProxyServiceBuilder.name);

  constructor(private readonly podSpecUtil: PodSpecUtil) {}

  public async build(
    kubeClientFactory: KubeClientFactory,
    namespace: Namespace,
  ): Promise<void> {
    const k8sApi = kubeClientFactory.getCoreV1ApiClient();
    const rbacApi = kubeClientFactory.getRbacAuthorizationV1Api();

    await Promise.all([
      this.createDbProxyPod(k8sApi, namespace),
      this.createDbProxyService(k8sApi, namespace),
      this.createRoleAndBinding(rbacApi, namespace),
    ]);
  }

  public async destroy(
    kubeClientFactory: KubeClientFactory,
    namespace: MongoID,
  ): Promise<void> {
    const k8sApi = kubeClientFactory.getCoreV1ApiClient();
    const rbacApi = kubeClientFactory.getRbacAuthorizationV1Api();
    const namespaceId = namespace.toString();

    try {
      await Promise.all([
        k8sApi.deleteNamespacedService(
          `${PROXY_SERVICE_NAME}-service-${namespace}`,
          namespaceId,
        ),
        k8sApi.deleteNamespacedReplicationController(
          PROXY_SERVICE_NAME,
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
        rbacApi.deleteNamespacedRole('pod-reader', namespaceId),
        rbacApi.deleteNamespacedRoleBinding('read-pod-metrics', namespaceId),
      ]);
    } catch (err) {
      this.logger.error(err.message);
      throw err;
    }
  }

  private async createDbProxyPod(
    k8sApi: CoreV1Api,
    namespace: Namespace,
  ): Promise<void> {
    const namespaceId = namespace.id.toString();

    try {
      await k8sApi.createNamespacedReplicationController(namespaceId, {
        metadata: {
          name: PROXY_SERVICE_NAME,
          namespace: namespaceId,
        },
        spec: {
          replicas: 1,
          selector: {
            app: PROXY_SERVICE_NAME,
          },
          template: {
            metadata: {
              labels: {
                app: PROXY_SERVICE_NAME,
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
                  name: PROXY_SERVICE_NAME,
                  image: this.podSpecUtil.imageName(PROXY_SERVICE_NAME),
                  imagePullPolicy:
                    process.env.IMAGE_PULL_POLICY || 'IfNotPresent',
                  volumeMounts: [
                    {
                      mountPath: '/app/Dokkimi',
                      name: 'proxy-service-files',
                    },
                  ],
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
                      name: 'INITIAL_URL_MAP',
                      value: JSON.stringify(calculateUrlMap(namespace)),
                    },
                    {
                      name: 'INITIAL_MOCK_ENDPOINTS',
                      value: JSON.stringify(
                        namespace.mockEndpoints.filter(
                          mock => mock.errors.length === 0,
                        ),
                      ),
                    },
                    {
                      name: 'BUGSNAG_API_KEY',
                      value: process.env.BUGSNAG_API_KEY,
                    },
                    {
                      name: 'MYSQL_USER',
                      value: DB_USERS.MYSQL_ADMIN,
                    },
                    {
                      name: 'MYSQL_PORT',
                      value: DB_PORTS.MYSQL.toString(),
                    },
                    {
                      name: 'POSTGRES_USER',
                      value: DB_USERS.POSTGRES_USER,
                    },
                    {
                      name: 'POSTGRES_PORT',
                      value: DB_PORTS.POSTGRES.toString(),
                    },
                  ],
                  resources: {
                    requests: {
                      memory: '100Mi',
                      cpu: '100m',
                    },
                    limits: {
                      memory: '600Mi',
                      cpu: '500m',
                    },
                  },
                },
              ],
              volumes: [
                {
                  name: 'proxy-service-files',
                  hostPath: {
                    path: DOKKIMI_LOCAL_FILES,
                    type: 'Directory',
                  },
                },
              ],
            },
          },
        },
      });
    } catch (e) {
      console.log(e);
      this.logger.error(e.message);
    }
  }

  private async createDbProxyService(
    k8sApi: CoreV1Api,
    namespace: Namespace,
  ): Promise<void> {
    const namespaceId = namespace.id.toString();

    try {
      await k8sApi.createNamespacedService(namespaceId, {
        metadata: {
          name: `${PROXY_SERVICE_NAME}-service-${namespaceId}`,
          namespace: namespaceId,
        },
        spec: {
          selector: {
            app: PROXY_SERVICE_NAME,
          },
          ports: [
            {
              name: PROXY_SERVICE_NAME,
              protocol: 'TCP',
              port: 5001,
            },
          ],
        },
      });
    } catch (e) {
      this.logger.error(e.message);
    }
  }

  private async createRoleAndBinding(
    rbacApi: RbacAuthorizationV1Api,
    namespace: Namespace,
  ): Promise<void> {
    const namespaceId = namespace.id.toString();

    await rbacApi.createNamespacedRole(namespaceId, {
      apiVersion: 'rbac.authorization.k8s.io/v1',
      kind: 'Role',
      metadata: {
        namespace: namespaceId,
        name: 'pod-reader',
      },
      rules: [
        {
          apiGroups: [''],
          resources: ['pods'],
          verbs: ['get', 'list', 'watch'],
        },
        {
          apiGroups: ['metrics.k8s.io'],
          resources: ['pods'],
          verbs: ['get', 'list', 'watch'],
        },
      ],
    });

    await rbacApi.createNamespacedRoleBinding(namespaceId, {
      apiVersion: 'rbac.authorization.k8s.io/v1',
      kind: 'RoleBinding',
      metadata: {
        name: 'read-pod-metrics',
        namespace: namespaceId,
      },
      subjects: [
        {
          kind: 'ServiceAccount',
          name: 'default',
          namespace: namespaceId,
        },
      ],
      roleRef: {
        kind: 'Role',
        name: 'pod-reader',
        apiGroup: 'rbac.authorization.k8s.io',
      },
    });
  }
}
