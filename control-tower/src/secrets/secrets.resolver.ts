import { UseGuards } from '@nestjs/common';
import { Args, Context, ID, Mutation, Query, Resolver } from '@nestjs/graphql';

import {
  CreateGuard,
  CreateOperationGuard,
} from '#src/auth/authorization/create.guard';
import {
  DeleteGuard,
  DeleteOperationGuard,
} from '#src/auth/authorization/delete.guard';
import {
  ReadGuard,
  ReadOperationGuard,
} from '#src/auth/authorization/read.guard';
import {
  UpdateGuard,
  UpdateOperationGuard,
} from '#src/auth/authorization/update.guard';
import { GqlUserStrategy } from '#src/auth/strategies/gqlUser.strategy';
import { DockerRegistrySecret, Organization } from '#src/mongo/models';
import { DockerRegistrySecretInput } from '#src/resolverInputs/dockerRegistrySecret.input';
import { SecretsService } from '#src/secrets/secrets.service';
import Ctx from '#src/types/graphql.context.type';
import { MongoID } from '#src/types/mongo.types';

const ORGANIZATION_ID = 'organizationId';
const SECRET_ID = 'secretId';

const returnSecret = () => DockerRegistrySecret;
const returnSecretsArr = () => [DockerRegistrySecret];

@UseGuards(
  GqlUserStrategy,
  CreateOperationGuard,
  ReadOperationGuard,
  UpdateOperationGuard,
  DeleteOperationGuard,
)
@Resolver(returnSecret)
export class SecretsResolver {
  constructor(private readonly secretsService: SecretsService) {}

  @Query(returnSecretsArr)
  @ReadGuard({
    className: Organization.name,
    param: ORGANIZATION_ID,
  })
  public orgSecrets(
    @Args(ORGANIZATION_ID, { type: () => ID })
    organizationId: MongoID,
  ): Promise<DockerRegistrySecret[]> {
    return this.secretsService.getOrgDockerRegistrySecrets(organizationId);
  }

  @Mutation(returnSecret)
  @CreateGuard({ param: ORGANIZATION_ID })
  public createSecret(
    @Context() { req }: Ctx,
    @Args(ORGANIZATION_ID, { type: () => ID }) organizationId: MongoID,
    @Args('secret', { type: () => DockerRegistrySecretInput })
    secret: DockerRegistrySecretInput,
  ): Promise<DockerRegistrySecret> {
    const { email } = req.user;

    return this.secretsService.createDockerRegistrySecret({
      ...secret,
      permissions: {
        organizationId,
        author: email,
        owner: email,
        memberOverrides: [],
      },
    });
  }

  @Mutation(returnSecret)
  @UpdateGuard({
    className: DockerRegistrySecret.name,
    param: SECRET_ID,
  })
  public updateSecret(
    @Args(SECRET_ID, { type: () => ID }) secretId: MongoID,
    @Args('secret', { type: () => DockerRegistrySecretInput })
    secret: DockerRegistrySecretInput,
  ): Promise<DockerRegistrySecret> {
    return this.secretsService.updateDockerRegistrySecret(secretId, secret);
  }

  @Mutation(returnSecret)
  @DeleteGuard({
    className: DockerRegistrySecret.name,
    param: SECRET_ID,
  })
  public deleteSecret(@Args(SECRET_ID, { type: () => ID }) secretId: MongoID) {
    return this.secretsService.deleteDockerRegistrySecret(secretId);
  }
}
