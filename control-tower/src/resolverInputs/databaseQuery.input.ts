import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class DatabaseQueryInput {
  @Field()
  database: string;

  @Field()
  dbName: string;

  @Field()
  command: string;
}
