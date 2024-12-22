import { Field, InputType } from '@nestjs/graphql';

import { HealthStatus, NamespaceItemType } from '#src/mongo/models';
import { CanvasInfoInput } from '#src/resolverInputs/namespaceItemInputs/canvasInfo.input';
import { NumericUsageInput } from '#src/resolverInputs/namespaceItemInputs/service.input';
import { PermissionsInput } from '#src/resolverInputs/permissions.input';
import { SUPPORTED_DATABASES } from '#src/types/database.types';

@InputType()
export class DatabaseInput {
  @Field(() => String, { nullable: true })
  itemId?: string;

  @Field(() => String, { defaultValue: 'Database', nullable: true })
  itemType?: NamespaceItemType;

  @Field(() => String, { nullable: true })
  displayName?: string;

  @Field(() => String, { nullable: true })
  database?: SUPPORTED_DATABASES;

  @Field(() => String, { nullable: true })
  initFile?: string;

  @Field(() => NumericUsageInput, { nullable: true })
  minResources?: NumericUsageInput;

  @Field(() => NumericUsageInput, { nullable: true })
  maxResources?: NumericUsageInput;

  @Field(() => PermissionsInput, { nullable: true })
  permissions?: PermissionsInput;

  @Field(() => CanvasInfoInput, { nullable: true })
  canvasInfo?: CanvasInfoInput;

  @Field(() => String, { nullable: true })
  namespaceStatus?: HealthStatus;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date;
}
