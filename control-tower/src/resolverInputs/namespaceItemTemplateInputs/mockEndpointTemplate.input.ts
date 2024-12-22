import { Field, InputType, Int } from '@nestjs/graphql';

import { NamespaceItemType } from '#src/mongo/models';

@InputType()
export class MockEndpointTemplateInput {
  @Field(() => String, { defaultValue: 'MockEndpoint', nullable: true })
  itemType: NamespaceItemType = 'MockEndpoint';

  @Field(() => String, { nullable: true })
  displayName?: string;

  @Field(() => String, { nullable: true, defaultValue: 'GET' })
  method?: string = 'GET';

  @Field(() => String, { nullable: true })
  origin?: string;

  @Field(() => String, { nullable: true })
  target?: string;

  @Field(() => String, { nullable: true, defaultValue: '/' })
  path?: string = '/';

  @Field(() => Int, { nullable: true })
  delayMS?: number;

  @Field(() => Int, { nullable: true })
  responseStatus?: number;

  @Field(() => String, { nullable: true })
  responseHeaders?: string;

  @Field(() => String, { nullable: true })
  responseBody?: string;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date;
}
