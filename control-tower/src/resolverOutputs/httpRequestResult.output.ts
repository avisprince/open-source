import { Field, Int, ObjectType } from '@nestjs/graphql';
import { AxiosResponse } from 'axios';
import GraphQLJSON from 'graphql-type-json';

@ObjectType()
export class HttpRequestResultOutput {
  @Field(() => Int)
  status: number;

  @Field(() => GraphQLJSON, { nullable: true })
  headers: AxiosResponse['headers'];

  @Field(() => GraphQLJSON, { nullable: true })
  data: JSON;
}
