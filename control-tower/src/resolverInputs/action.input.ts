import { Field, ID, InputType, Int } from '@nestjs/graphql';

@InputType()
export class ActionRequestInput {
  @Field(() => String, { nullable: true })
  method?: string;

  @Field(() => String, { nullable: true })
  origin?: string;

  @Field(() => String, { nullable: true })
  target?: string;

  @Field(() => String, { nullable: true })
  protocol?: string;

  @Field(() => String, { nullable: true })
  url?: string;

  @Field(() => String, { nullable: true })
  headers?: string;

  @Field(() => String, { nullable: true })
  body?: string;
}

@InputType()
export class ActionResponseInput {
  @Field(() => Int, { nullable: true })
  status?: number;

  @Field(() => String, { nullable: true })
  body?: string;

  @Field(() => String, { nullable: true })
  headers?: string;

  @Field(() => String, { nullable: true })
  origin?: string;

  @Field(() => String, { nullable: true })
  target?: string;
}

@InputType()
export class ActionInput {
  @Field(() => ID, { nullable: true })
  id?: string;

  @Field(() => String, { nullable: true })
  actionId?: string;

  @Field(() => String, { nullable: true })
  namespace?: string;

  @Field(() => ActionRequestInput, { nullable: true })
  request?: ActionRequestInput;

  @Field(() => ActionResponseInput, { nullable: true })
  response?: ActionResponseInput;

  @Field(() => String, { nullable: true })
  timestamp?: string;

  @Field(() => String, { nullable: true })
  type?: string;
}
