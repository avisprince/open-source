import { Field, ObjectType } from '@nestjs/graphql';

import { ItemTemplate } from '#src/mongo/models';
import { HttpRequestBase } from '#src/mongo/models/namespaceItemBase/httpRequest.base';

@ObjectType({ implements: () => [HttpRequestBase, ItemTemplate] })
export class HttpRequestTemplate
  extends HttpRequestBase
  implements ItemTemplate
{
  @Field(() => Boolean)
  isTemplate?: boolean = true;
}
