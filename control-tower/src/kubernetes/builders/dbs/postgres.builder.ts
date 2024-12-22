import { Injectable, Logger } from '@nestjs/common';

import { IDatabaseBuilderConfig } from '#src/kubernetes/builders/database.builder';
import { KubeClientFactory } from '#src/kubernetes/kubeConfig/kubeClient.factory';
import {
  Database,
  defaultMaxUsage,
  defaultMinUsage,
  Upload,
} from '#src/mongo/models';
import { DB_PORTS } from '#src/types/database.types';
import { MongoID } from '#src/types/mongo.types';

@Injectable()
export class PostgresBuilder {
  private readonly logger = new Logger(PostgresBuilder.name);

  public async build(buildConfig: IDatabaseBuilderConfig): Promise<void> {
    try {
      await this.createFluentdCnf(buildConfig);
      await this.createDBPod(buildConfig);
    } catch (e) {
      this.logger.error(
        `Failed to build database: ${buildConfig.database.database}`,
      );
      this.logger.error(e);
    }
  }

  private async createDBPod({
    k8sApi,
    namespaceId,
    database,
    initFilePath,
    port,
    image,
  }: IDatabaseBuilderConfig): Promise<void> {
    const { itemId, minResources, maxResources } = database;
    const podName = `${itemId}-db`;

    try {
      await k8sApi.createNamespacedReplicationController(namespaceId, {
        metadata: {
          name: podName,
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
              // initContainers: [
              //   {
              //     name: 'init-script-downloader',
              //     image: 'appropriate/curl',
              //     args: ['-o', '/tmp/data/init.sql', initFileUrl],
              //     volumeMounts: [
              //       {
              //         name: `${itemId}-init-script`,
              //         mountPath: '/tmp/data',
              //       },
              //     ],
              //   },
              // ],
              containers: [
                {
                  name: podName,
                  image,
                  env: [
                    {
                      name: 'POSTGRES_HOST_AUTH_METHOD',
                      value: 'trust',
                    },
                  ],
                  ports: [
                    {
                      containerPort: port,
                    },
                  ],
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
                  readinessProbe: {
                    exec: {
                      command: [
                        '/bin/sh',
                        '-c',
                        `psql -U postgres -c "SELECT 1;"`,
                      ],
                    },
                    initialDelaySeconds: 5,
                    periodSeconds: 5,
                  },
                  volumeMounts: [
                    {
                      name: `${itemId}-data`,
                      mountPath: '/var/lib/data',
                    },
                    {
                      name: `${itemId}-init-script`,
                      mountPath: '/docker-entrypoint-initdb.d',
                    },
                    {
                      name: 'postgresql-log-storage',
                      mountPath: '/var/log/postgresql',
                    },
                  ],
                  args: [
                    'postgres',
                    '-c',
                    'logging_collector=on',
                    '-c',
                    'log_line_prefix=[time=%t][ip=%h] ',
                    '-c',
                    'log_directory=/var/log/postgresql',
                    '-c',
                    'log_filename=postgresql.log',
                    '-c',
                    'log_statement=all',
                  ],
                },
                {
                  name: `${itemId}-fluentd`,
                  image:
                    'fluent/fluentd-kubernetes-daemonset:v1-debian-forward',
                  volumeMounts: [
                    {
                      name: 'postgresql-log-storage',
                      mountPath: '/var/log/postgresql',
                    },
                    {
                      name: `${itemId}-fluentd-config`,
                      mountPath: '/fluentd/etc/fluent.conf',
                      subPath: 'fluent.conf',
                    },
                  ],
                },
              ],
              volumes: [
                {
                  name: `${itemId}-init-script`,
                  hostPath: {
                    path: initFilePath,
                    type: 'Directory',
                  },
                },
                {
                  name: `${itemId}-data`,
                  persistentVolumeClaim: {
                    claimName: `${itemId}-data-pvc`,
                  },
                },
                {
                  name: 'postgresql-log-storage',
                  emptyDir: {},
                },
                {
                  name: `${itemId}-fluentd-config`,
                  configMap: {
                    name: `${itemId}-fluentd-config`,
                  },
                },
              ],
            },
          },
        },
      });
    } catch (err) {
      this.logger.error(err);
    }
  }

  public async getBuildConfig(
    kubeClientFactory: KubeClientFactory,
    namespaceId: MongoID,
    database: Database,
  ): Promise<IDatabaseBuilderConfig> {
    const buildConfig: IDatabaseBuilderConfig = {
      k8sApi: kubeClientFactory.getCoreV1ApiClient(),
      namespaceId: namespaceId.toString(),
      database,
      initFilePath: database.initFile
        ? (database.initFile as Upload).filePath
        : '',
      port: DB_PORTS.POSTGRES,
      image: 'postgres',
    };

    return buildConfig;
  }

  private async createFluentdCnf({
    database,
    namespaceId,
    k8sApi,
  }: IDatabaseBuilderConfig): Promise<void> {
    try {
      await k8sApi.createNamespacedConfigMap(namespaceId, {
        metadata: {
          name: `${database.itemId}-fluentd-config`,
        },
        data: {
          'fluent.conf': `
            <source>
              @type tail
              path /var/log/postgresql/postgresql.log
              pos_file /var/log/postgresql/postgresql.log.pos
              tag postgresql.*
              <parse>
                @type none
              </parse>
            </source>

            <match postgresql.**>
              @type http
              endpoint ${process.env.CONTROL_TOWER_URI}/actions/logQuery
              headers {
                "ApiKey": "${process.env.API_KEY}",
                "itemId": "${database.itemId}",
                "namespaceId": "${namespaceId}",
                "databaseType": "postgres"
              }
              json_array true
              
              <format>
                @type json
              </format>
              <buffer>
                flush_interval 0s
              </buffer>
            </match>
          `,
        },
      });
    } catch (e) {
      this.logger.error(e);
    }
  }

  private getConfigName(itemId: string) {
    return `${itemId}-db-config`;
  }
}
