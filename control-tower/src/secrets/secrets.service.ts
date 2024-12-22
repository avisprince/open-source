import { Injectable } from '@nestjs/common';

import { DockerRegistrySecret } from '#src/mongo/models';
import { DockerRegistrySecretsRepository } from '#src/mongo/repositories';
import { DockerRegistrySecretInput } from '#src/resolverInputs/dockerRegistrySecret.input';
import { MongoID } from '#src/types/mongo.types';

@Injectable()
export class SecretsService {
  constructor(
    private readonly dockerRegistrySecretsRepository: DockerRegistrySecretsRepository,
  ) {}

  public createDockerRegistrySecret(
    secret: Partial<DockerRegistrySecret>,
  ): Promise<DockerRegistrySecret> {
    return this.dockerRegistrySecretsRepository.create(secret);
  }

  public getOrgDockerRegistrySecrets(
    organizationId: MongoID,
  ): Promise<DockerRegistrySecret[]> {
    return this.dockerRegistrySecretsRepository.find({
      'permissions.organizationId': organizationId,
    });
  }

  public getDockerRegistrySecret(id: MongoID): Promise<DockerRegistrySecret> {
    return this.dockerRegistrySecretsRepository.findById(id);
  }

  public updateDockerRegistrySecret(
    id: MongoID,
    secret: DockerRegistrySecretInput,
  ): Promise<DockerRegistrySecret> {
    return this.dockerRegistrySecretsRepository.update(id, secret);
  }

  public deleteDockerRegistrySecret(
    id: MongoID,
  ): Promise<DockerRegistrySecret> {
    return this.dockerRegistrySecretsRepository.delete(id);
  }
}
