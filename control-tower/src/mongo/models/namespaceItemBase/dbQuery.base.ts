import { Field, InterfaceType } from '@nestjs/graphql';
import { Prop, Schema } from '@nestjs/mongoose';

import {
  DbQuery,
  DbQueryTemplate,
  NamespaceItemId,
  NamespaceItemType,
} from '#src/mongo/models';

@InterfaceType({
  resolveType(dbQuery: DbQueryBase) {
    return dbQuery.isTemplate ? DbQueryTemplate : DbQuery;
  },
})
@Schema({ timestamps: true })
export abstract class DbQueryBase {
  @Field(() => Boolean, { nullable: true })
  isTemplate?: boolean;

  @Field()
  @Prop({ type: String, default: 'DbQuery' })
  itemType: NamespaceItemType = 'DbQuery';

  @Field()
  @Prop()
  displayName: string;

  @Field(() => String, { nullable: true })
  @Prop()
  target?: NamespaceItemId;

  @Field(() => String, { nullable: true })
  @Prop()
  query?: string;

  @Field(() => String, { nullable: true })
  @Prop()
  useDatabase?: string;

  @Field(() => Date, { nullable: true })
  @Prop({ type: Date })
  updatedAt?: Date;
}
