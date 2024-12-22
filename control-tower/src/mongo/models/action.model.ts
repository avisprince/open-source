import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { Prop } from '@nestjs/mongoose';

import { stringifyMiddleware } from '#src/mongo/models/middleware';
import {
  NamespaceTraffic,
  NamespaceTrafficType,
} from '#src/mongo/models/namespaceTraffic/namespaceTraffic.interface';
import { MongoID } from '#src/types/mongo.types';

export type ActionType = 'request' | 'response';

@ObjectType({ implements: () => [NamespaceTraffic] })
export class Action implements NamespaceTraffic {
  @Field()
  @Prop({ type: String, default: 'Action' })
  trafficType: NamespaceTrafficType = 'Action';

  @Field(() => String)
  @Prop({ index: true, unique: true })
  id: string;

  @Field(() => String)
  @Prop({ index: true, unique: false })
  actionId: string;

  @Field(() => ID)
  @Prop({ type: MongoID, index: true })
  namespace: MongoID;

  @Field(() => String)
  @Prop()
  timestamp: string;

  @Field(() => String)
  @Prop()
  type: ActionType;

  @Field(() => String)
  @Prop()
  origin: string;

  @Field(() => String)
  @Prop()
  originDomain: string;

  @Field(() => String)
  @Prop()
  target: string;

  @Field()
  @Prop()
  targetDomain: string;

  @Field(() => String)
  @Prop()
  method: string;

  @Field(() => String)
  @Prop()
  protocol: string;

  @Field(() => String)
  @Prop()
  url: string;

  @Field(() => String, { middleware: [stringifyMiddleware] })
  @Prop({ type: Object })
  headers: object;

  @Field(() => String, { middleware: [stringifyMiddleware] })
  @Prop({ type: Object })
  body: object;

  @Field(() => Int, { nullable: true })
  @Prop(() => Number)
  status?: number;

  @Field(() => Boolean, { nullable: true })
  @Prop({ type: Boolean })
  isMocked?: boolean;
}
