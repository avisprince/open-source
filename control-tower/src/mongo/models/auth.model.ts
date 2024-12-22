import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { User } from '#src/mongo/models';
import { MongoID } from '#src/types/mongo.types';

@Schema({ timestamps: true, toJSON: { virtuals: true } })
export class Auth {
  id: MongoID;

  @Prop({ index: true, unique: true })
  accessToken: string;

  @Prop({ type: MongoID, ref: 'User' })
  user: MongoID | User;
}

export type AuthDocument = Auth & Document;

export const AuthSchema = SchemaFactory.createForClass(Auth);
