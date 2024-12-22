import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import GraphQLJSON from 'graphql-type-json';
import { Dictionary } from 'lodash';
import { Document } from 'mongoose';

import { MongoID } from '#src/types/mongo.types';

@ObjectType()
export class Usage {
  @Field(() => String)
  @Prop()
  cpu: string;

  @Field(() => String)
  @Prop()
  memory: string;
}

@ObjectType()
export class NumericUsage {
  @Field(() => Number)
  @Prop()
  cpu: number;

  @Field(() => Number)
  @Prop()
  memory: number;
}

@ObjectType()
export class NumericUsageWithTimestamp extends NumericUsage {
  @Field(() => Date)
  @Prop({ type: Date })
  timestamp: Date;
}

@ObjectType()
export class NodeMetrics {
  @Field(() => String)
  @Prop()
  name: string;

  @Field(() => Usage)
  @Prop({ type: Object })
  usage: Usage;
}

@ObjectType()
export class PodMetrics {
  @Field(() => String)
  @Prop()
  name: string;

  @Field(() => [Usage])
  @Prop({ type: [Object] })
  usage: Usage[];
}

@ObjectType()
export class Totals extends NumericUsage {
  @Field(() => GraphQLJSON)
  @Prop({ type: Object })
  nodes: Dictionary<NumericUsage>;
}

@ObjectType()
@Schema({ timestamps: true, toJSON: { virtuals: true } })
export class Telemetry {
  @Field(() => ID)
  id: MongoID;

  @Field(() => ID)
  @Prop()
  namespaceId: string;

  @Field(() => Totals)
  @Prop({ type: Object })
  totals: Totals;

  @Field(() => [NodeMetrics])
  @Prop({ type: [Object] })
  nodeMetrics: NodeMetrics[];

  @Field(() => [PodMetrics])
  @Prop({ type: [Object] })
  podMetrics: PodMetrics[];
}

export type TelemetryDocument = Telemetry & Document;

export const TelemetrySchema = SchemaFactory.createForClass(Telemetry);
