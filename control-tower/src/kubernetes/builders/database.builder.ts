import { CoreV1Api } from '@kubernetes/client-node';
import { Injectable, Logger } from '@nestjs/common';

import { MongoBuilder } from '#src/kubernetes/builders/dbs/mongo.builder';
import { MySQLBuilder } from '#src/kubernetes/builders/dbs/mysql.builder';
import { PostgresBuilder } from '#src/kubernetes/builders/dbs/postgres.builder';
import { patchNamespacedReplicationController } from '#src/kubernetes/builders/utils/kubernetes.util';
import { KubeClientFactory } from '#src/kubernetes/kubeConfig/kubeClient.factory';
import { Database } from '#src/mongo/models';
import { SUPPORTED_DATABASES } from '#src/types/database.types';
import { MongoID } from '#src/types/mongo.types';

export interface IDatabaseBuilderConfig {
  k8sApi: CoreV1Api;
  namespaceId: string;
  database: Database;
  initFilePath: string;
  image: string;
  port: number;
}

@Injectable()
export class DatabaseBuilder {
  private readonly logger = new Logger(DatabaseBuilder.name);

  constructor(
    private readonly mysqlBuilder: MySQLBuilder,
    private readonly postgresBuilder: PostgresBuilder,
    private readonly mongoBuilder: MongoBuilder,
  ) {}

  public async build(
    kubeClientFactory: KubeClientFactory,
    namespace: MongoID,
    database: Database,
  ): Promise<void> {
    try {
      const buildConfig = await this.getBuildConfig(
        kubeClientFactory,
        namespace,
        database,
      );

      await this.createPersistentDownloadVolume(buildConfig);
      await this.createPersistentDBVolume(buildConfig);
      await this.createDBService(buildConfig);

      if (database.database === SUPPORTED_DATABASES.MYSQL) {
        await this.mysqlBuilder.build(buildConfig);
      } else if (database.database === SUPPORTED_DATABASES.POSTGRES) {
        await this.postgresBuilder.build(buildConfig);
      } else if (database.database === SUPPORTED_DATABASES.MONGO) {
        await this.mongoBuilder.build(buildConfig);
      } else {
        throw new Error(`Unsupported database: ${database.database}`);
      }
    } catch (e) {
      this.logger.error(`Failed to build database: ${database.database}`);
      this.logger.error(e);
    }
  }

  public async destroy(
    kubeClientFactory: KubeClientFactory,
    namespaceId: string,
    itemId: string,
  ): Promise<void> {
    const k8sApi = kubeClientFactory.getCoreV1ApiClient();

    try {
      await patchNamespacedReplicationController(
        kubeClientFactory,
        `${itemId}-db`,
        namespaceId,
        {
          spec: {
            replicas: 0,
          },
        },
      );
      await k8sApi.deleteNamespacedService(`${itemId}-db-service`, namespaceId);
      await k8sApi.deleteNamespacedReplicationController(
        `${itemId}-db`,
        namespaceId,
      );
      await k8sApi.deleteNamespacedPersistentVolumeClaim(
        `${itemId}-data-pvc`,
        namespaceId,
      );
      await k8sApi.deleteNamespacedPersistentVolumeClaim(
        `${itemId}-init-script`,
        namespaceId,
      );
      try {
        await k8sApi.deleteNamespacedConfigMap(
          `${itemId}-db-config`,
          namespaceId,
        );
      } catch {}
      await k8sApi.deleteNamespacedConfigMap(
        `${itemId}-fluentd-config`,
        namespaceId,
      );
    } catch (err) {
      this.logger.error('Error in DatabaseBuilder destroy');
      this.logger.error(err.body);
    }
  }

  private async createDBService({
    k8sApi,
    namespaceId,
    database,
    port,
  }: IDatabaseBuilderConfig): Promise<void> {
    const podName = `${database.itemId}-db`;

    try {
      await k8sApi.createNamespacedService(namespaceId, {
        metadata: {
          name: `${database.itemId}-db-service`,
        },
        spec: {
          selector: {
            app: podName,
          },
          ports: [
            {
              port,
              protocol: 'TCP',
            },
          ],
        },
      });
    } catch (err) {
      this.logger.error(err);
    }
  }

  private async createPersistentDownloadVolume({
    k8sApi,
    namespaceId,
    database,
  }: IDatabaseBuilderConfig) {
    try {
      await k8sApi.createNamespacedPersistentVolumeClaim(namespaceId, {
        metadata: {
          name: `${database.itemId}-init-script`,
        },
        spec: {
          accessModes: ['ReadWriteOnce'],
          volumeMode: 'Filesystem',
          resources: {
            requests: {
              storage: '200Mi',
            },
          },
        },
      });
    } catch (err) {
      this.logger.error(err);
    }
  }

  private async createPersistentDBVolume({
    k8sApi,
    namespaceId,
    database,
  }: IDatabaseBuilderConfig) {
    try {
      await k8sApi.createNamespacedPersistentVolumeClaim(namespaceId, {
        metadata: {
          name: `${database.itemId}-data-pvc`,
        },
        spec: {
          accessModes: ['ReadWriteOnce'],
          volumeMode: 'Filesystem',
          resources: {
            requests: {
              storage: '500Mi',
            },
          },
        },
      });
    } catch (err) {
      this.logger.error(err);
    }
  }

  private async getBuildConfig(
    kubeClientFactory: KubeClientFactory,
    namespaceId: MongoID,
    database: Database,
  ): Promise<IDatabaseBuilderConfig> {
    switch (database.database) {
      case SUPPORTED_DATABASES.MYSQL: {
        return this.mysqlBuilder.getBuildConfig(
          kubeClientFactory,
          namespaceId,
          database,
        );
      }
      case SUPPORTED_DATABASES.POSTGRES: {
        return this.postgresBuilder.getBuildConfig(
          kubeClientFactory,
          namespaceId,
          database,
        );
      }
      case SUPPORTED_DATABASES.MONGO: {
        return this.mongoBuilder.getBuildConfig(
          kubeClientFactory,
          namespaceId,
          database,
        );
      }
      default: {
        throw new Error('DatabaseBuilder: Database not supported');
      }
    }
  }
}
