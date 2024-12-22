import { Field, ObjectType } from '@nestjs/graphql';
import { Prop } from '@nestjs/mongoose';

import { CanvasInfo, NamespaceItem, NamespaceItemId } from '#src/mongo/models';
import { DbQueryBase } from '#src/mongo/models/namespaceItemBase/dbQuery.base';

@ObjectType({ implements: () => [DbQueryBase, NamespaceItem] })
export class DbQuery extends DbQueryBase implements NamespaceItem {
  @Field(() => Boolean)
  isTemplate?: boolean = false;

  @Field()
  @Prop()
  itemId: NamespaceItemId;

  @Field(() => CanvasInfo)
  @Prop({ type: Object })
  canvasInfo: CanvasInfo;

  errors?: string[] = [];
}
