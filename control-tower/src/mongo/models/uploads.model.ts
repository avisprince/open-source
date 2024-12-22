import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { HasPermissions } from '#src/mongo/models';
import { SUPPORTED_DATABASES } from '#src/types/database.types';
import { MongoID } from '#src/types/mongo.types';

export enum UploadLocation {
  LOCAL = 'local',
}

export enum UploadType {
  DB_INIT_FILE = 'dbInitFile',
}

@ObjectType()
class UploadMetadata {
  @Field(() => String)
  @Prop()
  type: UploadType;

  @Field(() => String, { nullable: true })
  @Prop()
  database?: SUPPORTED_DATABASES;
}

@ObjectType()
@Schema({ timestamps: true, toJSON: { virtuals: true } })
export class Upload extends HasPermissions {
  @Field(() => ID)
  id: MongoID;

  @Field()
  @Prop()
  filePath: string;

  @Field()
  @Prop()
  fileName: string;

  @Field()
  @Prop()
  fileExtension: string;

  @Field()
  @Prop()
  uploadLocation: UploadLocation;

  @Field(() => UploadMetadata)
  @Prop({ type: Object })
  metadata: UploadMetadata;

  @Field(() => Number)
  @Prop()
  fileSizeInBytes: number;
}

export type UploadDocument = Upload;

export const UploadSchema = SchemaFactory.createForClass(Upload);
