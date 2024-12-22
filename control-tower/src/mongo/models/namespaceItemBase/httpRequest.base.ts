import { Field, InterfaceType } from '@nestjs/graphql';
import { Prop, Schema } from '@nestjs/mongoose';

import {
  HttpRequest,
  HttpRequestTemplate,
  NamespaceItemId,
  NamespaceItemType,
} from '#src/mongo/models';

@InterfaceType({
  resolveType(httpRequest: HttpRequestBase) {
    return httpRequest.isTemplate ? HttpRequestTemplate : HttpRequest;
  },
})
@Schema({ timestamps: true })
export abstract class HttpRequestBase {
  @Field(() => Boolean, { nullable: true })
  isTemplate?: boolean;

  @Field()
  @Prop({ type: String, default: 'HttpRequest' })
  itemType: NamespaceItemType = 'HttpRequest';

  @Field()
  @Prop()
  displayName: string;

  @Field(() => String, { nullable: true })
  @Prop()
  method?: string;

  @Field(() => String, { nullable: true })
  @Prop()
  target?: NamespaceItemId;

  @Field(() => String, { nullable: true })
  @Prop()
  protocol?: string;

  @Field(() => String, { nullable: true })
  @Prop()
  path?: string;

  @Field(() => String, { nullable: true })
  @Prop()
  headers?: string;

  @Field(() => String, { nullable: true })
  @Prop()
  body?: string;

  @Field(() => Date, { nullable: true })
  @Prop({ type: Date })
  updatedAt?: Date;
}
