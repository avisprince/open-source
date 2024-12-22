import { PermissionsInput } from '#src/resolverInputs/permissions.input';
import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
class NodePool {
  @Field()
  size: string;

  @Field(() => Int)
  count: number;

  @Field()
  name: string;

  @Field(() => Int)
  min_nodes: number;

  @Field(() => Int)
  max_nodes: number;

  @Field(() => Boolean)
  auto_scale: boolean;
}

@InputType()
export class ClusterConfigInput {
  @Field({ nullable: true })
  name?: string;

  @Field(() => [NodePool], { nullable: true })
  nodePools?: NodePool[];

  @Field(() => PermissionsInput, { nullable: true })
  permissions?: PermissionsInput;
}
