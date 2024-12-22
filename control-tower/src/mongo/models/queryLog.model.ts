import { Field, ObjectType } from '@nestjs/graphql';
import { Prop } from '@nestjs/mongoose';

import {
  NamespaceTraffic,
  NamespaceTrafficType,
} from '#src/mongo/models/namespaceTraffic/namespaceTraffic.interface';
import { SUPPORTED_DATABASES } from '#src/types/database.types';

@ObjectType({ implements: () => [NamespaceTraffic] })
export class QueryLog implements NamespaceTraffic {
  @Field()
  @Prop({ type: String, default: 'Query' })
  trafficType: NamespaceTrafficType = 'Query';

  @Field(() => String)
  @Prop({ index: true })
  queryId: string;

  @Field(() => String)
  @Prop({ type: String })
  databaseItemId: string;

  @Field(() => String)
  @Prop({ type: String })
  databaseType: SUPPORTED_DATABASES;

  @Field(() => String)
  @Prop({ type: String })
  query: string;

  @Field(() => String)
  @Prop({ type: String })
  originItemId: string;

  @Field(() => String)
  @Prop({ type: String })
  timestamp: string;

  @Field(() => Number, { nullable: true })
  @Prop({ type: Number })
  queryTime?: number;

  @Field(() => Number, { nullable: true })
  @Prop({ type: Number })
  rowsExamined?: number;

  @Field(() => Number, { nullable: true })
  @Prop({ type: Number })
  rowsSent?: number;
}
