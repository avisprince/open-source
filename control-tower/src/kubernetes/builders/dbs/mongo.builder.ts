import { Injectable, Logger } from '@nestjs/common';

import { IDatabaseBuilderConfig } from '#src/kubernetes/builders/database.builder';
import { KubeClientFactory } from '#src/kubernetes/kubeConfig/kubeClient.factory';
import { Database, Upload } from '#src/mongo/models';
import { DB_PORTS, SUPPORTED_DATABASES } from '#src/types/database.types';
import { MongoID } from '#src/types/mongo.types';

@Injectable()
export class MongoBuilder {
  private readonly logger = new Logger(MongoBuilder.name);

  public async build(buildConfig: IDatabaseBuilderConfig): Promise<void> {
    try {
      await this.createFluentdCnf(buildConfig);
      await this.createMongoCnf(buildConfig);
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
    const { itemId } = database;
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
              //     args: ['-o', '/tmp/data/init.js', initFile],
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
                  ports: [
                    {
                      containerPort: port,
                    },
                  ],
                  resources: {
                    requests: {
                      memory: '200Mi',
                      cpu: '50m',
                    },
                    limits: {
                      memory: '500Mi',
                      cpu: '200m',
                    },
                  },
                  readinessProbe: {
                    tcpSocket: {
                      port: 27017,
                    },
                    initialDelaySeconds: 5,
                    periodSeconds: 5,
                  },
                  volumeMounts: [
                    {
                      name: `${itemId}-data`,
                      mountPath: '/data/db',
                    },
                    {
                      name: `${itemId}-init-script`,
                      mountPath: '/docker-entrypoint-initdb.d',
                    },
                    {
                      name: this.getConfigName(itemId),
                      mountPath: '/etc/mongod.conf',
                      subPath: 'mongod.conf',
                    },
                    {
                      name: 'mongodb-log-storage',
                      mountPath: '/var/log/mongodb',
                    },
                  ],
                },
                {
                  name: `${itemId}-fluentd`,
                  image:
                    'fluent/fluentd-kubernetes-daemonset:v1-debian-forward',
                  volumeMounts: [
                    {
                      name: 'mongodb-log-storage',
                      mountPath: '/var/log/mongodb',
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
                    type: 'File',
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
                  name: 'mongodb-log-storage',
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
    const buildConfig: Partial<IDatabaseBuilderConfig> = {
      k8sApi: kubeClientFactory.getCoreV1ApiClient(),
      namespaceId: namespaceId.toString(),
      database,
      initFilePath: database.initFile
        ? (database.initFile as Upload).filePath
        : '',
    };
    buildConfig.port = DB_PORTS.MONGO;
    buildConfig.image = 'mongo';

    return buildConfig as IDatabaseBuilderConfig;
  }

  private async createMongoCnf({
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
          'mongod.conf': `
            systemLog:
              destination: file
              logAppend: true
              path: /var/log/mongodb/mongod.log
              slowms: 0
              sampleRate: 100
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
              path /var/log/mongodb/mongod.log
              pos_file /var/log/mongodb/mongod.log.pos
              tag mongo.*
              <parse>
                @type none
              </parse>
            </source>

            <match mongo.**>
              @type http
              endpoint ${process.env.CONTROL_TOWER_URI}/actions/logQuery
              headers {
                "ApiKey": "${process.env.API_KEY}",
                "itemId": "${database.itemId}",
                "namespaceId": "${namespaceId}",
                "databaseType": "${SUPPORTED_DATABASES.MONGO}"
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
