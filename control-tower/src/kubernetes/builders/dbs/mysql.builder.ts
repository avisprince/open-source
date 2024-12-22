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
export class MySQLBuilder {
  private readonly logger = new Logger(MySQLBuilder.name);

  public async build(buildConfig: IDatabaseBuilderConfig): Promise<void> {
    try {
      await this.createFluentdCnf(buildConfig);
      await this.createMySQLCnf(buildConfig);
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

    console.log('x', initFilePath);

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
                      name: 'MYSQL_ALLOW_EMPTY_PASSWORD',
                      value: 'yes',
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
                      command: ['/bin/sh', '-c', `mysql -u root -e "SELECT 1"`],
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
                      name: this.getConfigName(itemId),
                      mountPath: '/etc/mysql/conf.d/my.cnf',
                      subPath: 'my.cnf',
                    },
                    {
                      name: 'mysql-log-storage',
                      mountPath: '/var/log/mysql',
                    },
                  ],
                },
                {
                  name: `${itemId}-fluentd`,
                  image:
                    'fluent/fluentd-kubernetes-daemonset:v1-debian-forward',
                  resources: {
                    requests: {
                      memory: '100Mi',
                      cpu: '50m',
                    },
                    limits: {
                      memory: '200Mi',
                      cpu: '200m',
                    },
                  },
                  volumeMounts: [
                    {
                      name: 'mysql-log-storage',
                      mountPath: '/var/log/mysql',
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
                // {
                //   name: `${itemId}-init-script`,
                //   persistentVolumeClaim: {
                //     claimName: `${itemId}-init-script`,
                //   },
                // },
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
                  name: this.getConfigName(itemId),
                  configMap: {
                    name: this.getConfigName(itemId),
                  },
                },
                {
                  name: 'mysql-log-storage',
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
      port: DB_PORTS.MYSQL,
      image: 'mysql',
    };

    return buildConfig;
  }

  private async createMySQLCnf({
    database,
    namespaceId,
    k8sApi,
  }: IDatabaseBuilderConfig): Promise<void> {
    try {
      await k8sApi.createNamespacedConfigMap(namespaceId, {
        metadata: {
          name: this.getConfigName(database.itemId),
        },
        data: {
          'my.cnf': `
            [mysqld]
            slow_query_log=ON
            slow_query_log_file=/var/log/mysql/mysql-slow.log
            long_query_time=0
            log_queries_not_using_indexes=ON
          `,
        },
      });
    } catch (e) {
      this.logger.error(e);
    }
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
              path /var/log/mysql/mysql-slow.log
              pos_file /var/log/mysql/mysql.log.pos
              tag mysql.*
              <parse>
                @type none
              </parse>
            </source>

            <match mysql.**>
              @type http
              endpoint ${process.env.CONTROL_TOWER_URI}/actions/logQuery
              headers {
                "ApiKey": "${process.env.API_KEY}",
                "itemId": "${database.itemId}",
                "namespaceId": "${namespaceId}",
                "databaseType": "mysql"
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
