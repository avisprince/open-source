import { Field, ID, ObjectType } from '@nestjs/graphql';

import {
  ActiveUser,
  NamespaceHealth,
  NamespaceItemId,
} from '#src/mongo/models';
import { NumericUsageWithTimestamp } from '#src/mongo/models/telemetry.model';
import { MongoID } from '#src/types/mongo.types';

@ObjectType()
export class NamespaceHealthSubscriptionOutput {
  @Field(() => ID)
  namespaceId: MongoID;

  @Field(() => NamespaceHealth)
  namespaceHealth: NamespaceHealth;
}

export type NamespaceHealthPayload = {
  orgId: string;
  namespaceId: string;
  namespaceHealth: NamespaceHealth;
};

export type OrganizationUsagePayload = {
  orgId: string;
  usage: NumericUsageWithTimestamp;
};

@ObjectType()
export class NamespaceActiveUsersOutput {
  @Field(() => ID)
  orgId: MongoID;

  @Field(() => ID)
  namespaceId: MongoID;

  @Field(() => [ActiveUser])
  activeUsers: ActiveUser[];
}

@ObjectType()
export class DeleteNamespaceItemsOutput {
  @Field(() => [String])
  itemIds: NamespaceItemId[];
}
