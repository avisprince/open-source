import { Field, InputType } from '@nestjs/graphql';

import { HealthStatus, NamespaceItemType } from '#src/mongo/models';
import { CanvasInfoInput } from '#src/resolverInputs/namespaceItemInputs/canvasInfo.input';

@InputType()
export class DbQueryInput {
  @Field(() => String, { nullable: true })
  itemId?: string;

  @Field(() => String, { defaultValue: 'DbQuery', nullable: true  })
  itemType?: NamespaceItemType;

  @Field({ nullable: true })
  displayName?: string;

  @Field({ nullable: true })
  target?: string;

  @Field(() => String, { nullable: true })
  query?: object;

  @Field(() => String, { nullable: true })
  useDatabase?: object;

  @Field(() => CanvasInfoInput, { nullable: true })
  canvasInfo?: CanvasInfoInput;

  @Field(() => String, { nullable: true })
  namespaceStatus?: HealthStatus;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date;
}
