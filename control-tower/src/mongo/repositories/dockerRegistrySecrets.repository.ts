import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';

import {
  DockerRegistrySecret,
  DockerRegistrySecretDocument,
} from '#src/mongo/models';
import { DockerRegistrySecretInput } from '#src/resolverInputs/dockerRegistrySecret.input';
import { MongoID } from '#src/types/mongo.types';

@Injectable()
export class DockerRegistrySecretsRepository {
  constructor(
    @InjectModel(DockerRegistrySecret.name)
    private readonly dockerRegistrySecretModel: Model<DockerRegistrySecretDocument>,
  ) {}

  public create(
    secret: Partial<DockerRegistrySecret>,
  ): Promise<DockerRegistrySecret> {
    return this.dockerRegistrySecretModel.create(secret);
  }

  public findById(id: MongoID | string): Promise<DockerRegistrySecret> {
    return this.dockerRegistrySecretModel.findById(id).exec();
  }

  public find(
    filter: FilterQuery<DockerRegistrySecretDocument>,
  ): Promise<DockerRegistrySecret[]> {
    return this.dockerRegistrySecretModel.find(filter).exec();
  }

  public update(
    id: MongoID,
    secret: DockerRegistrySecretInput,
  ): Promise<DockerRegistrySecret> {
    return this.dockerRegistrySecretModel
      .findByIdAndUpdate(id, { $set: secret }, { new: true })
      .exec();
  }

  public delete(id: MongoID): Promise<DockerRegistrySecret> {
    return this.dockerRegistrySecretModel.findByIdAndDelete(id).exec();
  }
}
