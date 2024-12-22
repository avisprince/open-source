import { Field, InterfaceType } from '@nestjs/graphql';

import {
  CanvasInfo,
  Database,
  DbQuery,
  HealthStatus,
  HttpRequest,
  MockEndpoint,
  QueryHistory,
  Service,
  TrafficHistory,
} from '#src/mongo/models';
import { NumericUsage } from '#src/mongo/models/telemetry.model';

export type NamespaceItemId = string;
export type NamespaceItemType =
  | 'Service'
  | 'Database'
  | 'HttpRequest'
  | 'MockEndpoint'
  | 'DbQuery'
  | 'TrafficHistory'
  | 'QueryHistory';

@InterfaceType({
  resolveType(item: NamespaceItem) {
    if (item.itemType === 'Service') {
      return Service;
    } else if (item.itemType === 'Database') {
      return Database;
    } else if (item.itemType === 'HttpRequest') {
      return HttpRequest;
    } else if (item.itemType === 'MockEndpoint') {
      return MockEndpoint;
    } else if (item.itemType === 'DbQuery') {
      return DbQuery;
    } else if (item.itemType === 'TrafficHistory') {
      return TrafficHistory;
    } else if (item.itemType === 'QueryHistory') {
      return QueryHistory;
    } else {
      return null;
    }
  },
})
export abstract class NamespaceItem {
  @Field()
  itemType: NamespaceItemType;

  @Field(() => String)
  itemId: NamespaceItemId;

  @Field()
  displayName: string;

  @Field(() => CanvasInfo)
  canvasInfo: CanvasInfo;

  @Field(() => String, { nullable: true })
  namespaceStatus?: HealthStatus;

  @Field(() => NumericUsage, { nullable: true })
  usage?: NumericUsage;

  @Field(() => [String], { defaultValue: [], nullable: true })
  errors?: string[] = [];
}
