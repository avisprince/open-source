import { NamespaceItemType } from '#src/mongo/models';
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class HttpRequestTemplateInput {
  @Field(() => String, { defaultValue: 'HttpRequest', nullable: true })
  itemType: NamespaceItemType = 'HttpRequest';

  @Field(() => String, { nullable: true })
  displayName?: string;

  @Field(() => String, { nullable: true })
  path?: string;

  @Field(() => String, { nullable: true })
  method?: string;

  @Field(() => String, { nullable: true })
  origin?: string;

  @Field(() => String, { nullable: true })
  target?: string;

  @Field(() => String, { nullable: true })
  headers?: object;

  @Field(() => String, { nullable: true })
  body?: object;
}
