import { ECRClient } from '#src/kubernetes/clients/ecr.client';
import { KubeClientFactory } from '#src/kubernetes/kubeConfig/kubeClient.factory';
import { DockerRegistrySecret } from '#src/mongo/models';
import { MongoID } from '#src/types/mongo.types';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SecretsBuilder {
  private readonly logger = new Logger(SecretsBuilder.name);

  constructor(private readonly ecrClient: ECRClient) {}

  public async build(
    kubeClientFactory: KubeClientFactory,
    namespace: MongoID,
    secretName: string,
    dockerRegistrySecret: DockerRegistrySecret,
  ): Promise<void> {
    const k8sApi = kubeClientFactory.getCoreV1ApiClient();
    const namespaceId = namespace.toString();

    const buffer =
      dockerRegistrySecret.repository === 'ECR'
        ? await this.getECRBuffer(dockerRegistrySecret)
        : this.getDockerHubBuffer(dockerRegistrySecret);

    try {
      await k8sApi.createNamespacedSecret(namespaceId, {
        metadata: {
          name: `${secretName}-secret-${namespaceId}`,
        },
        data: {
          '.dockerconfigjson': buffer.toString('base64'),
        },
        type: 'kubernetes.io/dockerconfigjson',
      });
    } catch (err) {
      this.logger.error(err);
    }
  }

  public async destroy(
    kubeClientFactory: KubeClientFactory,
    namespace: MongoID,
    name: string,
  ): Promise<void> {
    const k8sApi = kubeClientFactory.getCoreV1ApiClient();
    const namespaceId = namespace.toString();

    try {
      await k8sApi.deleteNamespacedSecret(
        `${name}-secret-${namespaceId}`,
        namespaceId,
      );
    } catch (err) {
      this.logger.error(err.body);
    }
  }

  private getDockerHubBuffer(
    dockerRegistrySecret: DockerRegistrySecret,
  ): Buffer {
    return Buffer.from(
      JSON.stringify({
        auths: {
          'https://index.docker.io/v1/': {
            auth: dockerRegistrySecret.auth,
          },
        },
      }),
    );
  }

  private async getECRBuffer(
    dockerRegistrySecret: DockerRegistrySecret,
  ): Promise<Buffer> {
    const { username, password } = await this.ecrClient.getAuthToken(
      dockerRegistrySecret.ecrClientId,
      dockerRegistrySecret.ecrClientRegion,
    );

    const url = `${dockerRegistrySecret.ecrClientId}.dkr.ecr.${dockerRegistrySecret.ecrClientRegion}.amazonaws.com`;

    return Buffer.from(
      JSON.stringify({
        auths: {
          [url]: {
            username,
            password,
            email: 'none',
          },
        },
      }),
    );
  }
}
