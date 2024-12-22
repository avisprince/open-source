import { Field, InterfaceType } from '@nestjs/graphql';

import {
  DatabaseTemplate,
  DbQueryTemplate,
  HttpRequestTemplate,
  MockEndpointTemplate,
  NamespaceItemType,
  ServiceTemplate,
} from '#src/mongo/models';

@InterfaceType({
  resolveType(item: ItemTemplate) {
    if (item.itemType === 'Service') {
      return ServiceTemplate;
    } else if (item.itemType === 'Database') {
      return DatabaseTemplate;
    } else if (item.itemType === 'HttpRequest') {
      return HttpRequestTemplate;
    } else if (item.itemType === 'MockEndpoint') {
      return MockEndpointTemplate;
    } else if (item.itemType === 'DbQuery') {
      return DbQueryTemplate;
    } else {
      return null;
    }
  },
})
export abstract class ItemTemplate {
  @Field()
  itemType: NamespaceItemType;

  @Field()
  displayName: string;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date;
}
