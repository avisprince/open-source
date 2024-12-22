import { Field, InterfaceType } from '@nestjs/graphql';
import { Prop, Schema } from '@nestjs/mongoose';

import {
  Database,
  DatabaseTemplate,
  defaultMaxUsage,
  defaultMinUsage,
  NamespaceItemType,
  Upload,
} from '#src/mongo/models';
import { NumericUsage } from '#src/mongo/models/telemetry.model';
import { SUPPORTED_DATABASES } from '#src/types/database.types';
import { MongoID } from '#src/types/mongo.types';

@InterfaceType({
  resolveType(database: DatabaseBase) {
    return database.isTemplate ? DatabaseTemplate : Database;
  },
})
@Schema({ timestamps: true })
export abstract class DatabaseBase {
  @Field(() => Boolean, { nullable: true })
  isTemplate?: boolean;

  @Field()
  @Prop({ type: String, default: 'Database' })
  itemType: NamespaceItemType = 'Database';

  @Field()
  @Prop()
  displayName: string;

  @Field({ nullable: true })
  @Prop()
  database?: SUPPORTED_DATABASES;

  @Field(() => Upload, { nullable: true })
  @Prop({ type: String, ref: 'Upload' })
  initFile?: Upload | MongoID;

  @Field(() => NumericUsage, { defaultValue: defaultMinUsage })
  @Prop({ type: Object })
  minResources?: NumericUsage = defaultMinUsage;

  @Field(() => NumericUsage, { defaultValue: defaultMaxUsage })
  @Prop({ type: Object })
  maxResources?: NumericUsage = defaultMaxUsage;

  @Field(() => Date, { nullable: true })
  @Prop({ type: Date })
  updatedAt?: Date;
}
