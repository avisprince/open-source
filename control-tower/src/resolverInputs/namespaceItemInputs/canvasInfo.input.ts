import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CanvasInfoInput {
  @Field(() => Number, { nullable: true })
  posX?: number;

  @Field(() => Number, { nullable: true })
  posY?: number;
}
