import { Field, ID, InputType } from '@nestjs/graphql';

import { NamespaceItemType, NamespaceType } from '#src/mongo/models';
import { CanvasInfoInput } from '#src/resolverInputs/namespaceItemInputs/canvasInfo.input';
import { DatabaseInput } from '#src/resolverInputs/namespaceItemInputs/database.input';
import { DbQueryInput } from '#src/resolverInputs/namespaceItemInputs/dbQuery.input';
import { HttpRequestInput } from '#src/resolverInputs/namespaceItemInputs/httpRequest.input';
import { MockEndpointInput } from '#src/resolverInputs/namespaceItemInputs/mockEndpoint.input';
import { ServiceInput } from '#src/resolverInputs/namespaceItemInputs/service.input';
import { TrafficHistoryInput } from '#src/resolverInputs/namespaceItemInputs/trafficHistory.input';
import { PermissionsInput } from '#src/resolverInputs/permissions.input';
import { QueryHistoryInput } from '#src/resolverInputs/queryHistory.input';
import { MongoID } from '#src/types/mongo.types';

export type NamespaceItemInputType =
  | ServiceInput
  | DatabaseInput
  | HttpRequestInput
  | MockEndpointInput
  | DbQueryInput
  | TrafficHistoryInput
  | QueryHistoryInput;

@InputType()
export class NewNamespaceItemInput {
  @Field(() => String)
  itemType: NamespaceItemType;

  name?: string;

  @Field(() => String)
  displayName: string;

  @Field(() => CanvasInfoInput)
  canvasInfo: CanvasInfoInput;
}

@InputType()
export class NamespaceItemPositionInput {
  @Field(() => String)
  itemId: string;

  @Field(() => CanvasInfoInput)
  canvasInfo: CanvasInfoInput;
}

@InputType()
export class NamespaceItemInput {
  @Field(() => String)
  itemType: NamespaceItemType;

  @Field(() => ServiceInput, { nullable: true })
  service?: ServiceInput;

  @Field(() => DatabaseInput, { nullable: true })
  database?: DatabaseInput;

  @Field(() => HttpRequestInput, { nullable: true })
  httpRequest?: HttpRequestInput;

  @Field(() => MockEndpointInput, { nullable: true })
  mockEndpoint?: MockEndpointInput;

  @Field(() => DbQueryInput, { nullable: true })
  dbQuery?: DbQueryInput;

  @Field(() => TrafficHistoryInput, { nullable: true })
  trafficHistory?: TrafficHistoryInput;

  @Field(() => QueryHistoryInput, { nullable: true })
  queryHistory?: QueryHistoryInput;
}

@InputType()
export class NamespaceInput {
  @Field(() => ID, { nullable: true })
  id?: MongoID;

  @Field(() => String, { nullable: true })
  type?: NamespaceType;

  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => PermissionsInput, { nullable: true })
  permissions?: PermissionsInput;
}
