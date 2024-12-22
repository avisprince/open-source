import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { Action, Namespace } from '#src/mongo/models';
import { MongoID } from '#src/types/mongo.types';

@ObjectType()
export class ValidationError {
  @Field(() => [String])
  @Prop({ type: [String] })
  path: string[];

  @Field()
  @Prop()
  message: string;
}

@ObjectType()
export class TestRunTestCaseAssertion {
  @Field()
  @Prop()
  schema: string;

  @Field(() => Action)
  @Prop({ type: Object })
  action: Action;

  @Field(() => Boolean)
  @Prop({ type: Boolean })
  success: boolean;

  @Field(() => [String], { defaultValue: [] })
  @Prop({ type: [String] })
  errors: string[];
}

@ObjectType()
export class TestRunTestCase {
  @Field(() => ID)
  @Prop()
  namespaceId: MongoID;

  @Field()
  @Prop()
  testCaseId: string;

  @Field()
  @Prop()
  testCaseName: string;

  @Field(() => Boolean)
  @Prop({ type: Boolean })
  success: boolean;

  @Field(() => [TestRunTestCaseAssertion])
  @Prop({ type: [Object] })
  assertions: TestRunTestCaseAssertion[];
}

@ObjectType()
@Schema({ timestamps: true, toJSON: { virtuals: true } })
export class TestRun {
  @Field(() => ID)
  id: MongoID;

  @Field()
  @Prop()
  name: string;

  @Field(() => ID)
  @Prop({ type: MongoID, ref: 'TestSuite' })
  testSuiteId: MongoID;

  @Field(() => [Namespace], { defaultValue: [] })
  @Prop({ type: [MongoID], ref: 'Namespace' })
  namespaces: Namespace[] | MongoID[];

  @Field(() => Boolean, { nullable: true })
  @Prop({ type: Boolean })
  failedToLaunch?: boolean;

  @Field(() => Date, { nullable: true })
  @Prop({ type: Date })
  startTime?: Date;

  @Field(() => Date, { nullable: true })
  @Prop({ type: Date })
  endTime?: Date;

  @Field(() => [TestRunTestCase], { defaultValue: [] })
  @Prop({ type: [Object] })
  testCases: TestRunTestCase[];

  @Field(() => Boolean, { nullable: true })
  @Prop({ type: Boolean })
  success: boolean;
}

export type TestRunDocument = TestRun & Document;

export const TestRunSchema = SchemaFactory.createForClass(TestRun);
