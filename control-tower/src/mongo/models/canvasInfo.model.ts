import { Field, ObjectType } from '@nestjs/graphql';
import { Prop } from '@nestjs/mongoose';

@ObjectType()
export class CanvasInfo {
  @Field(() => Number)
  @Prop({ type: Number })
  posX: number;

  @Field(() => Number)
  @Prop({ type: Number })
  posY: number;
}
