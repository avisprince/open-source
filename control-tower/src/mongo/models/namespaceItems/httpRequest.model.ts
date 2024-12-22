import { Field, ObjectType } from '@nestjs/graphql';
import { Prop } from '@nestjs/mongoose';

import { CanvasInfo, NamespaceItem, NamespaceItemId } from '#src/mongo/models';
import { HttpRequestBase } from '#src/mongo/models/namespaceItemBase/httpRequest.base';

@ObjectType({ implements: () => [HttpRequestBase, NamespaceItem] })
export class HttpRequest extends HttpRequestBase implements NamespaceItem {
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
