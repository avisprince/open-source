import { Field, InputType, Int } from '@nestjs/graphql';

import { HealthStatus, NamespaceItemType } from '#src/mongo/models';
import { CanvasInfoInput } from '#src/resolverInputs/namespaceItemInputs/canvasInfo.input';

@InputType()
export class MockEndpointInput {
  @Field(() => String, { nullable: true })
  itemId?: string;

  @Field(() => String, { defaultValue: 'MockEndpoint', nullable: true })
  itemType: NamespaceItemType;

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

  @Field(() => CanvasInfoInput, { nullable: true })
  canvasInfo?: CanvasInfoInput;

  @Field(() => String, { nullable: true })
  namespaceStatus?: HealthStatus;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date;
}
