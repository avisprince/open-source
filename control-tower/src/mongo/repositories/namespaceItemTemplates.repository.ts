import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';

import {
  NamespaceItemTemplate,
  NamespaceItemTemplateDocument,
} from '#src/mongo/models';
import { MongoID } from '#src/types/mongo.types';

@Injectable()
export class NamespaceItemTemplatesRepository {
  constructor(
    @InjectModel(NamespaceItemTemplate.name)
    private readonly namespaceItemTemplateModel: Model<NamespaceItemTemplateDocument>,
  ) {}

  public async create(
    namespaceItemTemplate: NamespaceItemTemplate,
  ): Promise<NamespaceItemTemplate> {
    const { id } = await this.namespaceItemTemplateModel.create(
      namespaceItemTemplate,
    );

    return {
      ...namespaceItemTemplate,
      id,
    };
  }

  public findById(id: MongoID | string): Promise<NamespaceItemTemplate> {
    return this.namespaceItemTemplateModel
      .findById(id)
      .populate(this.populateService())
      .exec();
  }

  public find(
    filter: FilterQuery<NamespaceItemTemplate>,
  ): Promise<NamespaceItemTemplate[]> {
    return this.namespaceItemTemplateModel
      .find(filter)
      .populate(this.populateService())
      .exec();
  }

  public update(
    id: MongoID,
    namespaceItemTemplate: NamespaceItemTemplate,
  ): Promise<NamespaceItemTemplate> {
    return this.namespaceItemTemplateModel
      .findByIdAndUpdate(id, { $set: namespaceItemTemplate }, { new: true })
      .populate(this.populateService())
      .exec();
  }

  public delete(id: MongoID): Promise<NamespaceItemTemplate> {
    return this.namespaceItemTemplateModel.findByIdAndDelete(id).exec();
  }

  private populateService() {
    return {
      path: 'template',
      populate: [
        {
          path: 'dockerRegistrySecret',
          model: 'DockerRegistrySecret',
        },
      ],
    };
  }
}
