import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { OrganizationRoles } from '#src/constants/roles.constants';
import { User } from '#src/mongo/models';
import {
  NumericUsage,
  NumericUsageWithTimestamp,
} from '#src/mongo/models/telemetry.model';
import { MongoID } from '#src/types/mongo.types';

export const defaultOrgResources: NumericUsage = {
  cpu: 1000,
  memory: 2000,
};

@ObjectType()
export class OrganizationMember {
  @Field(() => String)
  @Prop()
  email: string;

  @Field(() => String)
  @Prop()
  role: OrganizationRoles;

  @Field(() => User)
  @Prop({ type: MongoID, ref: 'User' })
  user: MongoID | User;
}

@ObjectType()
@Schema({ timestamps: true, toJSON: { virtuals: true } })
export class Organization {
  @Field(() => ID)
  id: MongoID;

  @Field(() => ID, { nullable: true })
  @Prop({ type: MongoID })
  parentOrganization?: MongoID;

  @Field(() => String)
  @Prop()
  name: string;

  @Field(() => String, { nullable: true })
  @Prop()
  image?: string;

  @Field(() => [OrganizationMember], { defaultValue: [] })
  @Prop({ type: [Object] })
  members: OrganizationMember[] = [];

  @Field(() => [Organization], { defaultValue: [] })
  @Prop({ type: [MongoID], ref: 'Organization' })
  groups: Organization[] = [];

  @Field({ nullable: true })
  @Prop()
  paymentPlan?: 'demo' | 'free' | 'monthly' | 'yearly' | 'admin';

  @Field(() => NumericUsage, { defaultValue: defaultOrgResources })
  @Prop({ type: Object })
  allocatedResources?: NumericUsage = defaultOrgResources;

  @Field(() => [NumericUsageWithTimestamp], { nullable: true })
  @Prop({ type: [Object] })
  usage?: NumericUsageWithTimestamp[];

  @Field(() => ID)
  @Prop({ type: MongoID })
  creator: MongoID;

  @Field(() => ID)
  @Prop({ type: MongoID })
  owner: MongoID;

  @Field(() => Boolean)
  @Prop({ type: Boolean })
  isPersonal: boolean;
}

export type OrganizationDocument = Organization & Document;

export const OrganizationSchema = SchemaFactory.createForClass(Organization);
