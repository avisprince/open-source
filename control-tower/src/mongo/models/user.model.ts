import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { Organization } from '#src/mongo/models';
import { MongoID } from '#src/types/mongo.types';

@ObjectType()
@Schema({ timestamps: true, toJSON: { virtuals: true } })
export class User {
  @Field(() => ID)
  id: MongoID;

  @Field(() => String)
  @Prop()
  name: string;

  @Field(() => String)
  @Prop({ index: true, unique: true })
  email: string;

  @Field(() => Boolean)
  @Prop()
  emailVerified: boolean;

  @Field(() => String)
  @Prop()
  picture: string;

  @Field(() => [Organization])
  @Prop({ type: [MongoID], ref: 'Organization' })
  organizations: MongoID[] | Organization[];
}

export type UserDocument = User & Document;

export const UserSchema = SchemaFactory.createForClass(User);
