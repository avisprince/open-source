import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import {
  CanvasInfo,
  NamespaceItem,
  NamespaceItemId,
  NamespaceItemType,
} from '#src/mongo/models';

@ObjectType({ implements: () => [NamespaceItem] })
@Schema({ timestamps: true })
export class QueryHistory implements NamespaceItem {
  @Field()
  @Prop({ type: String, default: 'QueryHistory' })
  itemType: NamespaceItemType = 'QueryHistory';

  @Field()
  @Prop()
  itemId: NamespaceItemId;

  @Field({ nullable: true })
  @Prop()
  originItemId?: NamespaceItemId;

  @Field({ nullable: true })
  @Prop()
  databaseItemId?: NamespaceItemId;

  @Field()
  @Prop()
  displayName: string;

  @Field(() => Date, { nullable: true })
  @Prop({ type: Date })
  updatedAt?: Date;

  @Field(() => CanvasInfo)
  @Prop({ type: Object })
  canvasInfo: CanvasInfo;

  errors?: string[] = [];
}

export type QueryHistoryDocument = QueryHistory & Document;

export const QueryHistorySchema = SchemaFactory.createForClass(QueryHistory);
