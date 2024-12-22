import { Field, ObjectType } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

@ObjectType()
export class DatabaseQueryResultOutput {
  @Field(() => String)
  query: string;

  @Field(() => GraphQLJSON, { nullable: true })
  result: JSON;
}
