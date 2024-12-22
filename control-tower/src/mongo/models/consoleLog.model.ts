import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Prop } from '@nestjs/mongoose';

@ObjectType()
export class ConsoleLog {
  @Field(() => Int)
  @Prop()
  timestamp: number;

  @Field()
  @Prop()
  itemId: string;

  @Field()
  @Prop()
  message: string;
}
