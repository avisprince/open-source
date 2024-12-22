import { Field, InputType } from '@nestjs/graphql';

import { HealthStatus, NamespaceItemType } from '#src/mongo/models';
import { ActionRequestInput } from '#src/resolverInputs/action.input';
import { CanvasInfoInput } from '#src/resolverInputs/namespaceItemInputs/canvasInfo.input';

@InputType()
export class HttpRequestInput extends ActionRequestInput {
  @Field(() => String, { nullable: true })
  itemId?: string;

  @Field(() => String, { defaultValue: 'HttpRequest', nullable: true  })
  itemType?: NamespaceItemType;

  @Field(() => String, { nullable: true })
  displayName?: string;

  @Field(() => String, { nullable: true })
  path?: string;

  @Field(() => CanvasInfoInput, { nullable: true })
  canvasInfo?: CanvasInfoInput;

  @Field(() => String, { nullable: true })
  namespaceStatus?: HealthStatus;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date;
}
