import { Field, InputType } from '@nestjs/graphql';

import { NamespaceItemType } from '#src/mongo/models';
import { DatabaseTemplateInput } from '#src/resolverInputs/namespaceItemTemplateInputs/databaseTemplate.input';
import { DbQueryTemplateInput } from '#src/resolverInputs/namespaceItemTemplateInputs/dbQueryTemplate.input';
import { HttpRequestTemplateInput } from '#src/resolverInputs/namespaceItemTemplateInputs/httpRequestTemplate.input';
import { MockEndpointTemplateInput } from '#src/resolverInputs/namespaceItemTemplateInputs/mockEndpointTemplate.input';
import { ServiceTemplateInput } from '#src/resolverInputs/namespaceItemTemplateInputs/serviceTemplate.input';
import { PermissionsInput } from '#src/resolverInputs/permissions.input';

export type NamespaceItemTemplateInputType =
  | ServiceTemplateInput
  | DatabaseTemplateInput
  | HttpRequestTemplateInput
  | MockEndpointTemplateInput
  | DbQueryTemplateInput;

@InputType()
export class NamespaceItemTemplateInput {
  @Field(() => String)
  itemType: NamespaceItemType;

  template: NamespaceItemTemplateInputType;

  @Field(() => ServiceTemplateInput, { nullable: true })
  service?: ServiceTemplateInput;

  @Field(() => DatabaseTemplateInput, { nullable: true })
  database?: DatabaseTemplateInput;

  @Field(() => HttpRequestTemplateInput, { nullable: true })
  httpRequest?: HttpRequestTemplateInput;

  @Field(() => MockEndpointTemplateInput, { nullable: true })
  mockEndpoint?: MockEndpointTemplateInput;

  @Field(() => DbQueryTemplateInput, { nullable: true })
  dbQuery?: DbQueryTemplateInput;

  @Field(() => PermissionsInput, { nullable: true })
  permissions?: PermissionsInput;
}
