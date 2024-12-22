import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Prop } from '@nestjs/mongoose';

import { EditPermissions } from '#src/constants/roles.constants';
import { MongoID } from '#src/types/mongo.types';

@ObjectType()
export class MemberOverride {
  @Field()
  @Prop()
  email: string;

  @Field()
  @Prop()
  editPermissions: EditPermissions;
}

@ObjectType()
export class Permissions {
  @Field(() => ID)
  @Prop({ type: MongoID })
  organizationId: MongoID;

  @Field()
  @Prop()
  author: string;

  @Field({ nullable: true })
  @Prop()
  owner?: string;

  @Field(() => [MemberOverride])
  @Prop({ type: [Object], default: [] })
  memberOverrides: MemberOverride[];
}

@ObjectType()
export abstract class HasPermissions {
  @Field(() => Permissions)
  @Prop({ type: Object })
  permissions: Permissions;
}
