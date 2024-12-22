import { Field, InputType } from '@nestjs/graphql';

import { PermissionsInput } from '#src/resolverInputs/permissions.input';

@InputType()
export class ClusterInput {
  @Field({ nullable: true })
  name?: string;

  @Field(() => PermissionsInput, { nullable: true })
  permissions?: PermissionsInput;
}
