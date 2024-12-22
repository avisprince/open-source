import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class TestCaseAssertionInput {
  @Field()
  schema: string;

  @Field()
  action: string;
}

@InputType()
export class TestCaseInput {
  @Field(() => String, { nullable: true })
  id?: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  execution: string;

  @Field(() => [TestCaseAssertionInput], { defaultValue: [] })
  assertions: TestCaseAssertionInput[];
}
