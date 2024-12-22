import { Injectable } from '@nestjs/common';

import {
  ItemTemplate,
  NamespaceItemTemplate,
  Permissions,
  User,
} from '#src/mongo/models';
import { NamespaceItemTemplatesRepository } from '#src/mongo/repositories';
import {
  NamespaceItemTemplateInput,
  NamespaceItemTemplateInputType,
} from '#src/resolverInputs/namespaceItemTemplateInputs/namespaceItemTemplate.input';
import { MongoID } from '#src/types/mongo.types';

@Injectable()
export class NamespaceItemTemplatesService {
  constructor(
    private readonly namespaceItemTemplatesRepository: NamespaceItemTemplatesRepository,
  ) {}

  public getUserTemplates(user: User): Promise<NamespaceItemTemplate[]> {
    return this.namespaceItemTemplatesRepository.find({
      'permissions.organizationId': {
        $in: user.organizations.map(org => org.id),
      },
    });
  }

  public getNamespaceItemTemplates(
    organizationId: MongoID,
  ): Promise<Array<NamespaceItemTemplate>> {
    return this.namespaceItemTemplatesRepository.find({
      'permissions.organizationId': organizationId,
    });
  }

  public getNamespaceItemTemplate(
    namespaceItemTemplateId: MongoID | string,
  ): Promise<NamespaceItemTemplate> {
    return this.namespaceItemTemplatesRepository.findById(
      namespaceItemTemplateId,
    );
  }

  public createNamespaceItemTemplate(
    namespaceItemTemplate: NamespaceItemTemplate,
  ): Promise<NamespaceItemTemplate> {
    return this.namespaceItemTemplatesRepository.create(namespaceItemTemplate);
  }

  public updateNamespaceItemTemplate(
    namespaceItemTemplateId: MongoID,
    namespaceItemTemplate: NamespaceItemTemplateInput,
  ): Promise<NamespaceItemTemplate> {
    const itemTemplate = this.extractItemTemplateFromInput(
      namespaceItemTemplate,
    );

    return this.namespaceItemTemplatesRepository.update(
      namespaceItemTemplateId,
      {
        template: itemTemplate as ItemTemplate,
        permissions: namespaceItemTemplate.permissions as Permissions,
      },
    );
  }

  public deleteNamespaceItemTemplate(
    id: MongoID,
  ): Promise<NamespaceItemTemplate> {
    return this.namespaceItemTemplatesRepository.delete(id);
  }

  private extractItemTemplateFromInput(
    input: NamespaceItemTemplateInput,
  ): NamespaceItemTemplateInputType {
    switch (input.itemType) {
      case 'Service': {
        return input.service;
      }
      case 'Database': {
        return input.database;
      }
      case 'HttpRequest': {
        return input.httpRequest;
      }
      case 'MockEndpoint': {
        return input.mockEndpoint;
      }
      case 'DbQuery': {
        return input.dbQuery;
      }
    }
  }
}
