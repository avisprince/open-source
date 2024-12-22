import { Field, ID, InputType } from '@nestjs/graphql';

import { PermissionsInput } from '#src/resolverInputs/permissions.input';
import { MongoID } from '#src/types/mongo.types';

@InputType()
export class TestSuiteInput {
  @Field(() => ID, { nullable: true })
  id?: MongoID;

  @Field(() => String, { nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => [String], { nullable: true, defaultValue: [] })
  namespaces?: MongoID[];

  @Field({ nullable: true })
  schedule?: string;

  @Field(() => PermissionsInput, { nullable: true })
  permissions?: PermissionsInput;
}
