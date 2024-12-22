import { Field, ObjectType } from '@nestjs/graphql';
import { Schema } from '@nestjs/mongoose';

import { ItemTemplate } from '#src/mongo/models';
import { DatabaseBase } from '#src/mongo/models/namespaceItemBase/database.base';

@ObjectType({ implements: () => [DatabaseBase, ItemTemplate] })
@Schema({ timestamps: true, toJSON: { virtuals: true } })
export class DatabaseTemplate extends DatabaseBase implements ItemTemplate {
  @Field(() => Boolean)
  isTemplate?: boolean = true;
}
