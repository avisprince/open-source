import { Field, ObjectType } from '@nestjs/graphql';

import { ItemTemplate } from '#src/mongo/models';
import { DbQueryBase } from '#src/mongo/models/namespaceItemBase/dbQuery.base';

@ObjectType({ implements: () => [DbQueryBase, ItemTemplate] })
export class DbQueryTemplate extends DbQueryBase implements ItemTemplate {
  @Field(() => Boolean)
  isTemplate?: boolean = true;
}
