import { createUnionType, Field, ID, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import {
  DatabaseTemplate,
  DbQueryTemplate,
  HttpRequestTemplate,
  ItemTemplate,
  MockEndpointTemplate,
  ServiceTemplate,
} from '#src/mongo/models';
import { HasPermissions } from '#src/mongo/models/permissions.model';
import { MongoID } from '#src/types/mongo.types';

export const NamespaceItemTemplateUnion = createUnionType({
  name: 'NamespaceItemTemplateInputUnion',
  types: () =>
    [
      ServiceTemplate,
      DatabaseTemplate,
      HttpRequestTemplate,
      MockEndpointTemplate,
      DbQueryTemplate,
    ] as const,
});

@ObjectType()
@Schema({ timestamps: true, toJSON: { virtuals: true } })
export class NamespaceItemTemplate extends HasPermissions {
  @Field(() => ID, { nullable: true })
  id?: MongoID;

  @Field(() => ItemTemplate)
  @Prop({ type: Object })
  template:
    | ServiceTemplate
    | DatabaseTemplate
    | HttpRequestTemplate
    | MockEndpointTemplate
    | DbQueryTemplate;

  @Field(() => Date, { nullable: true })
  @Prop({ type: Date })
  updatedAt?: Date;
}

export type NamespaceItemTemplateDocument = NamespaceItemTemplate & Document;

export const NamespaceItemTemplateSchema = SchemaFactory.createForClass(
  NamespaceItemTemplate,
);
