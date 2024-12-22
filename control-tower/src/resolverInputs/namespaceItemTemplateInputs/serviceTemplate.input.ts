import { Field, ID, InputType } from '@nestjs/graphql';

import { NamespaceItemType } from '#src/mongo/models';
import { EnvVarInput } from '#src/resolverInputs/namespaceItemInputs/service.input';
import { MongoID } from '#src/types/mongo.types';

@InputType()
export class ServiceTemplateInput {
  @Field(() => String, { defaultValue: 'Service', nullable: true })
  itemType: NamespaceItemType = 'Service';

  @Field(() => String, { nullable: true })
  displayName?: string;

  @Field({ nullable: true })
  port?: number;

  @Field({ nullable: true })
  domain?: string;

  @Field({ nullable: true })
  image?: string;

  @Field({ nullable: true })
  healthCheck?: string;

  @Field(() => [EnvVarInput], { nullable: true })
  env?: EnvVarInput[] = [];

  @Field(() => ID, { nullable: true })
  dockerRegistrySecret?: MongoID;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date;
}
