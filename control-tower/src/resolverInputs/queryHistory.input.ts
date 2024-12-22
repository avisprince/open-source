import { Field, InputType } from '@nestjs/graphql';

import { HealthStatus, NamespaceItemType } from '#src/mongo/models';
import { CanvasInfoInput } from '#src/resolverInputs/namespaceItemInputs/canvasInfo.input';

@InputType()
export class QueryHistoryInput {
  @Field(() => String, { nullable: true })
  itemId?: string;

  @Field(() => String, { defaultValue: 'QueryHistory', nullable: true  })
  itemType?: NamespaceItemType;

  @Field({ nullable: true })
  displayName?: string;

  @Field(() => CanvasInfoInput)
  canvasInfo: CanvasInfoInput;

  @Field({ nullable: true })
  originItemId?: string;

  @Field({ nullable: true })
  databaseItemId?: string;

  @Field(() => String, { nullable: true })
  namespaceStatus?: HealthStatus;
}
