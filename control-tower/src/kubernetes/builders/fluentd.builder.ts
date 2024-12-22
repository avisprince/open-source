import { Injectable, Logger } from '@nestjs/common';

import { BOOLEAN } from '#src/constants/environment.constants';
import { KubeClientFactory } from '#src/kubernetes/kubeConfig/kubeClient.factory';
import { MongoID } from '#src/types/mongo.types';

const FLUENTD = 'fluentd';
const FLUENT_CONF = 'fluent-conf';

@Injectable()
export class FluentdBuilder {
  private readonly logger = new Logger(FluentdBuilder.name);

  public async build(
    kubeClientFactory: KubeClientFactory,
    namespace: MongoID,
  ): Promise<void> {
    const namespaceId = namespace.toString();

    await Promise.all([
      this.createServiceAccount(kubeClientFactory, namespaceId),
      this.createClusterRole(kubeClientFactory, namespaceId),
      this.createClusterRoleBinding(kubeClientFactory, namespaceId),
      this.createFluentdConf(kubeClientFactory, namespaceId),
    ]);

    await this.createDaemonSet(kubeClientFactory, namespaceId);
  }

  public async destroy(
    kubeClientFactory: KubeClientFactory,
    namespace: MongoID,
  ): Promise<void> {
    const namespaceId = namespace.toString();
    const coreClient = kubeClientFactory.getCoreV1ApiClient();
    const appsClient = kubeClientFactory.getAppsV1ApiClient();
    const rbacClient = kubeClientFactory.getRbacAuthorizationV1Api();
    const namespacedFluentd = `${FLUENTD}-${namespaceId}`;

    try {
      await Promise.all([
        appsClient.deleteNamespacedDaemonSet(namespacedFluentd, namespaceId),
        coreClient.deleteNamespacedConfigMap(FLUENT_CONF, namespaceId),
        coreClient.deleteNamespacedServiceAccount(
          namespacedFluentd,
          namespaceId,
        ),
        rbacClient.deleteClusterRole(namespacedFluentd),
        rbacClient.deleteClusterRoleBinding(namespacedFluentd),
      ]);
    } catch (e) {
      this.logger.error(e.message);
    }
  }

  private async createServiceAccount(
    kubeClientFactory: KubeClientFactory,
    namespace: string,
  ): Promise<void> {
    const k8s = kubeClientFactory.getCoreV1ApiClient();

    try {
      await k8s.createNamespacedServiceAccount(namespace, {
        metadata: {
          name: `${FLUENTD}-${namespace}`,
          namespace,
        },
      });
    } catch (err) {
      this.logger.error(err);
    }
  }

  private async createClusterRole(
    kubeClientFactory: KubeClientFactory,
    namespace: string,
  ) {
    const k8s = kubeClientFactory.getRbacAuthorizationV1Api();

    try {
      await k8s.createClusterRole({
        metadata: {
          name: `${FLUENTD}-${namespace}`,
          namespace,
        },
        rules: [
          {
            apiGroups: [''],
            resources: ['pods', 'namespaces'],
            verbs: ['get', 'list', 'watch'],
          },
        ],
      });
    } catch (err) {
      this.logger.error(err);
    }
  }

  private async createClusterRoleBinding(
    kubeClientFactory: KubeClientFactory,
    namespace: string,
  ) {
    const k8s = kubeClientFactory.getRbacAuthorizationV1Api();
    const name = `${FLUENTD}-${namespace}`;

    try {
      await k8s.createClusterRoleBinding({
        metadata: {
          name,
        },
        roleRef: {
          kind: 'ClusterRole',
          name,
          apiGroup: 'rbac.authorization.k8s.io',
        },
        subjects: [
          {
            kind: 'ServiceAccount',
            name,
            namespace,
          },
        ],
      });
    } catch (err) {
      this.logger.error(err);
    }
  }

  private async createDaemonSet(
    kubeClientFactory: KubeClientFactory,
    namespace: string,
  ): Promise<void> {
    const k8sApi = kubeClientFactory.getAppsV1ApiClient();
    const name = `${FLUENTD}-${namespace}`;

    try {
      await k8sApi.createNamespacedDaemonSet(namespace, {
        metadata: {
          name,
          namespace,
          labels: {
            app: name,
          },
        },
        spec: {
          selector: {
            matchLabels: {
              app: name,
            },
          },
          template: {
            metadata: {
              labels: {
                app: name,
              },
            },
            spec: {
              serviceAccount: name,
              serviceAccountName: name,
              tolerations: [
                {
                  key: 'node-role.kubernetes.io/master',
                  effect: 'NoSchedule',
                },
              ],
              containers: [
                {
                  name: name,
                  image:
                    'fluent/fluentd-kubernetes-daemonset:v1-debian-forward',
                  env: [
                    {
                      name: 'FLUENT_UID',
                      value: '0',
                    },
                    {
                      name: 'FLUENTD_SYSTEMD_CONF',
                      value: 'disable',
                    },
                  ],
                  resources: {
                    limits: {
                      memory: '1000Mi',
                    },
                    requests: {
                      cpu: '500m',
                      memory: '500Mi',
                    },
                  },
                  volumeMounts: [
                    {
                      name: FLUENT_CONF,
                      mountPath: '/fluentd/etc/fluent.conf',
                      subPath: 'fluent.conf',
                    },
                    {
                      name: 'varlog',
                      mountPath: '/var/log',
                    },
                    {
                      name: 'varlibdockercontainers',
                      mountPath: '/var/lib/docker/containers',
                      readOnly: true,
                    },
                  ],
                },
              ],
              volumes: [
                {
                  name: FLUENT_CONF,
                  configMap: {
                    name: FLUENT_CONF,
                  },
                },
                {
                  name: 'varlog',
                  hostPath: {
                    path: '/var/log',
                  },
                },
                {
                  name: 'varlibdockercontainers',
                  hostPath: {
                    path: '/var/lib/docker/containers',
                  },
                },
              ],
            },
          },
        },
      });
    } catch (e) {
      this.logger.error(e);
    }
  }

  private async createFluentdConf(
    kubeClientFactory: KubeClientFactory,
    namespace: string,
  ): Promise<void> {
    const k8sApi = kubeClientFactory.getCoreV1ApiClient();

    try {
      await k8sApi.createNamespacedConfigMap(namespace, {
        metadata: {
          name: FLUENT_CONF,
        },
        data: {
          'fluent.conf': `
            <source>
              @type tail
              read_from_head true
              tag dokkimi.*
              path /var/log/containers/*-pod-${namespace}*.log
              pos_file /var/log/fluentd-containers.log.pos
              exclude_path ["/var/log/containers/fluent*"]
              <parse>
                @type ${
                  process.env.USE_LOCAL_CLUSTER === BOOLEAN.TRUE
                    ? 'json'
                    : 'none'
                }
              </parse>
            </source>

            <filter dokkimi.**>
              @type record_transformer

              <record>
                namespaceId ${namespace}
                logFile \${tag}
              </record>
            </filter>

            <match dokkimi.**>
              @type copy

              <store>
                @type http
                endpoint ${process.env.CONTROL_TOWER_URI}/actions/logConsole
                headers {"ApiKey": "${process.env.API_KEY}"}
                json_array true

                <format>
                  @type json
                </format>
                <buffer>
                  flush_interval 0s
                </buffer>
              </store>

              <store>
                @type stdout
              </store>
            </match>
          `,
        },
      });
    } catch (e) {
      this.logger.error(e);
    }
  }
}
