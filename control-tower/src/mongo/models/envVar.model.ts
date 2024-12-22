import { Field, ObjectType } from '@nestjs/graphql';
import { Prop } from '@nestjs/mongoose';

@ObjectType()
export class EnvVar {
  @Field()
  @Prop()
  name: string;

  @Field()
  @Prop()
  value: string;
}
