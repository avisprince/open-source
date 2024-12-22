import { Field, ID, InputType } from '@nestjs/graphql';

import { HealthStatus, NamespaceItemType } from '#src/mongo/models';
import { CanvasInfoInput } from '#src/resolverInputs/namespaceItemInputs/canvasInfo.input';
import { PermissionsInput } from '#src/resolverInputs/permissions.input';
import { MongoID } from '#src/types/mongo.types';

@InputType()
export class EnvVarInput {
  @Field()
  name: string;

  @Field()
  value: string;
}

@InputType()
export class NumericUsageInput {
  @Field(() => Number)
  cpu: number;

  @Field(() => Number)
  memory: number;
}

@InputType()
export class ServiceInput {
  @Field(() => String, { nullable: true })
  itemId?: string;

  @Field(() => String, { defaultValue: 'Service', nullable: true })
  itemType?: NamespaceItemType;

  @Field(() => String, { nullable: true })
  displayName?: string;

  @Field(() => String, { nullable: true })
  domain?: string;

  @Field(() => Number, { nullable: true })
  port?: number;

  @Field(() => String, { nullable: true })
  image?: string;

  @Field(() => String, { nullable: true })
  healthCheck?: string;

  @Field(() => NumericUsageInput, { nullable: true })
  minResources?: NumericUsageInput;

  @Field(() => NumericUsageInput, { nullable: true })
  maxResources?: NumericUsageInput;

  @Field(() => [EnvVarInput], { nullable: true, defaultValue: [] })
  env?: EnvVarInput[];

  @Field(() => PermissionsInput, { nullable: true })
  permissions?: PermissionsInput;

  @Field(() => CanvasInfoInput, { nullable: true })
  canvasInfo?: CanvasInfoInput;

  @Field(() => String, { nullable: true })
  namespaceStatus?: HealthStatus;

  @Field(() => ID, { nullable: true })
  dockerRegistrySecret?: MongoID;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date;
}
