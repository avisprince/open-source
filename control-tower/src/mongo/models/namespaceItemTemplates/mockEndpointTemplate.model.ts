import { Field, ObjectType } from '@nestjs/graphql';

import { ItemTemplate } from '#src/mongo/models';
import { MockEndpointBase } from '#src/mongo/models/namespaceItemBase/mockEndpoint.base';

@ObjectType({ implements: () => [MockEndpointBase, ItemTemplate] })
export class MockEndpointTemplate
  extends MockEndpointBase
  implements ItemTemplate
{
  @Field(() => Boolean)
  isTemplate?: boolean = true;
}
