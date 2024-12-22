import { Field, InputType } from '@nestjs/graphql';

import { NamespaceItemType } from '#src/mongo/models';
import { SUPPORTED_DATABASES } from '#src/types/database.types';

@InputType()
export class DatabaseTemplateInput {
  @Field(() => String, { defaultValue: 'Database', nullable: true })
  itemType: NamespaceItemType = 'Database';

  @Field(() => String, { nullable: true })
  displayName?: string;

  @Field(() => String, { nullable: true })
  database?: SUPPORTED_DATABASES;

  @Field(() => String, { nullable: true })
  initFile?: string;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date;
}
