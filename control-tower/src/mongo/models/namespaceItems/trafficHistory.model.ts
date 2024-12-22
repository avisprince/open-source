import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema } from '@nestjs/mongoose';

import {
  CanvasInfo,
  NamespaceItem,
  NamespaceItemId,
  NamespaceItemType,
} from '#src/mongo/models';

@ObjectType({ implements: () => [NamespaceItem] })
@Schema({ timestamps: true })
export class TrafficHistory implements NamespaceItem {
  @Field()
  @Prop({ type: String, default: 'TrafficHistory' })
  itemType: NamespaceItemType = 'TrafficHistory';

  @Field()
  @Prop()
  itemId: NamespaceItemId;

  @Field({ nullable: true })
  @Prop()
  node1?: NamespaceItemId;

  @Field({ nullable: true })
  @Prop()
  node2?: NamespaceItemId;

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
