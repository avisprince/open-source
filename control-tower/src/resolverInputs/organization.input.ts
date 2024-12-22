import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class OrganizationInput {
  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => String, { nullable: true })
  image?: string;
}
