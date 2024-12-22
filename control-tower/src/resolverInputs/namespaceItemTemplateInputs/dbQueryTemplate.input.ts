import { Field, InputType } from '@nestjs/graphql';

import { NamespaceItemType } from '#src/mongo/models';

@InputType()
export class DbQueryTemplateInput {
  @Field(() => String, { defaultValue: 'DbQuery', nullable: true })
  itemType: NamespaceItemType = 'DbQuery';

  @Field(() => String, { nullable: true })
  displayName?: string;

  @Field(() => String, { nullable: true })
  target?: string;

  @Field(() => String, { nullable: true })
  query?: string;

  @Field(() => String, { nullable: true })
  useDatabase?: string;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date;
}
