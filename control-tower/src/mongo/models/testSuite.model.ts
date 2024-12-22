import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { HasPermissions, Namespace, TestRun } from '#src/mongo/models';
import { MongoID } from '#src/types/mongo.types';

@ObjectType()
export class SuccessRate {
  @Field(() => String)
  @Prop()
  id: string;

  @Field(() => Number, { defaultValue: 0 })
  @Prop({ type: Number })
  numberOfRuns: number;

  @Field(() => Number, { defaultValue: 0 })
  @Prop({ type: Number })
  successRate: number;
}

@ObjectType()
@Schema({ timestamps: true, toJSON: { virtuals: true } })
export class TestSuite extends HasPermissions {
  @Field(() => ID)
  id: MongoID;

  @Field(() => String)
  @Prop()
  name: string;

  @Field(() => String, { nullable: true })
  @Prop()
  description?: string;

  @Field(() => [Namespace], { defaultValue: [] })
  @Prop({ type: [MongoID], ref: 'Namespace' })
  namespaces: MongoID[] | Namespace[];

  @Field(() => [TestRun], { defaultValue: [] })
  @Prop({ type: [MongoID], ref: 'TestRun' })
  testRuns: MongoID[] | TestRun[];

  @Field(() => Number, { defaultValue: 0 })
  @Prop({ type: Number })
  numberOfRuns: number;

  @Field(() => Number, { defaultValue: 0 })
  @Prop({ type: Number })
  successRate: number;

  @Field(() => [SuccessRate])
  @Prop({ type: [Object] })
  testCaseSuccessRates: SuccessRate[];

  @Field(() => [SuccessRate])
  @Prop({ type: [Object] })
  namespaceSuccessRates: SuccessRate[];

  @Field({ nullable: true })
  @Prop()
  schedule?: string;
}

export type TestSuiteDocument = TestSuite & Document;

export const TestSuiteSchema = SchemaFactory.createForClass(TestSuite);
