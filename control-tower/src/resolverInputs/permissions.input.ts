import { Field, ID, InputType } from '@nestjs/graphql';

import { EditPermissions } from '#src/constants/roles.constants';
import { MongoID } from '#src/types/mongo.types';

@InputType()
class MemberOverrideInput {
  @Field(() => String, { nullable: true })
  email?: string;

  @Field()
  editPermissions?: EditPermissions;
}

@InputType()
export class PermissionsInput {
  @Field(() => ID, { nullable: true })
  organizationId?: MongoID;

  @Field(() => String, { nullable: true })
  author?: string;

  @Field(() => String, { nullable: true })
  owner?: string;

  @Field(() => [MemberOverrideInput], { nullable: true, defaultValue: [] })
  memberOverrides?: MemberOverrideInput[];
}
