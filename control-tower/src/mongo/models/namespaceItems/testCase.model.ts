import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Prop } from '@nestjs/mongoose';

import { Action } from '#src/mongo/models/action.model';
import isValidJSON from '#src/utils/isValidJSON';

@ObjectType()
export class TestCaseAssertion {
  @Field()
  @Prop()
  schema: string;

  @Field(() => Action)
  @Prop({ type: Object })
  action: Action;
}

@ObjectType()
export class TestCase {
  @Field(() => String)
  @Prop({ index: true, unique: true })
  id: string;

  @Field()
  @Prop()
  name: string;

  @Field(() => Date, { nullable: true })
  @Prop({ type: Date })
  updatedAt?: Date;

  @Field(() => Action)
  @Prop({ type: Object })
  execution: Action;

  @Field(() => [TestCaseAssertion], { defaultValue: [] })
  @Prop({ type: [Object] })
  assertions: TestCaseAssertion[] = [];

  @Field(() => Int, { nullable: true })
  @Prop({ type: Number })
  delay?: number;

  errors?: string[] = [];

  static validate(testCase: TestCase): string[] {
    const errors = [];

    if (!testCase.name) {
      errors.push('MISSING_DISPLAY_NAME');
    }
    if (!testCase.execution) {
      errors.push('MISSING_EXECUTION');
    }

    if (
      testCase.assertions?.some(assertion => !isValidJSON(assertion.schema))
    ) {
      errors.push('INVALID_TEST_CASE_SCHEMA');
    }

    return errors;
  }
}
