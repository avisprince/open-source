import { Field, ObjectType } from '@nestjs/graphql';
import { Schema } from '@nestjs/mongoose';

import { ItemTemplate } from '#src/mongo/models';
import { ServiceBase } from '#src/mongo/models/namespaceItemBase/service.base';

@ObjectType({ implements: () => [ServiceBase, ItemTemplate] })
@Schema({ timestamps: true, toJSON: { virtuals: true } })
export class ServiceTemplate extends ServiceBase implements ItemTemplate {
  @Field(() => Boolean)
  isTemplate?: boolean = true;
}
