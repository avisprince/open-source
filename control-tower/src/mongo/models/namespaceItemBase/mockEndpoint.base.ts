import { Field, Int, InterfaceType } from '@nestjs/graphql';
import { Prop, Schema } from '@nestjs/mongoose';

import {
  MockEndpoint,
  MockEndpointTemplate,
  NamespaceItemType,
} from '#src/mongo/models';

@InterfaceType({
  resolveType(mockEndpoint: MockEndpointBase) {
    return mockEndpoint.isTemplate ? MockEndpointTemplate : MockEndpoint;
  },
})
@Schema({ timestamps: true })
export abstract class MockEndpointBase {
  @Field(() => Boolean, { nullable: true })
  isTemplate?: boolean;

  @Field(() => String)
  @Prop({ type: String, default: 'MockEndpoint' })
  itemType: NamespaceItemType = 'MockEndpoint';

  @Field(() => String)
  @Prop()
  displayName: string;

  @Field(() => String, { nullable: true })
  @Prop()
  method?: string;

  @Field(() => String, { nullable: true })
  @Prop()
  origin?: string;

  @Field(() => String, { nullable: true })
  @Prop()
  target?: string;

  @Field(() => String, { nullable: true })
  @Prop()
  path?: string;

  @Field(() => Int, { nullable: true })
  @Prop({ type: Int })
  delayMS?: number;

  @Field(() => Int, { nullable: true })
  @Prop({ type: Int })
  responseStatus?: number;

  @Field(() => String, { nullable: true })
  @Prop()
  responseHeaders?: string;

  @Field(() => String, { nullable: true })
  @Prop()
  responseBody?: string;

  @Field(() => Date, { nullable: true })
  @Prop({ type: Date })
  updatedAt?: Date;
}
