import { HealthStatus, NamespaceItemType } from '#src/mongo/models';
import { CanvasInfoInput } from '#src/resolverInputs/namespaceItemInputs/canvasInfo.input';
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class TrafficHistoryInput {
  @Field(() => String, { nullable: true })
  itemId?: string;

  @Field(() => String, { defaultValue: 'TrafficHistory', nullable: true  })
  itemType?: NamespaceItemType;

  @Field({ nullable: true })
  displayName?: string;

  @Field(() => CanvasInfoInput, { nullable: true })
  canvasInfo?: CanvasInfoInput;

  @Field({ nullable: true })
  node1?: string;

  @Field({ nullable: true })
  node2?: string;

  @Field(() => String, { nullable: true })
  namespaceStatus?: HealthStatus;
}
