import { Field, Int, InterfaceType } from '@nestjs/graphql';
import { Prop, Schema } from '@nestjs/mongoose';

import {
  defaultMaxUsage,
  defaultMinUsage,
  DockerRegistrySecret,
  EnvVar,
  NamespaceItemType,
  Service,
  ServiceTemplate,
} from '#src/mongo/models';
import { NumericUsage } from '#src/mongo/models/telemetry.model';
import { MongoID } from '#src/types/mongo.types';

@InterfaceType({
  resolveType(service: ServiceBase) {
    return service.isTemplate ? ServiceTemplate : Service;
  },
})
@Schema({ timestamps: true })
export abstract class ServiceBase {
  @Field(() => Boolean, { nullable: true })
  isTemplate?: boolean;

  @Field(() => String)
  @Prop({ type: String, default: 'Service' })
  itemType: NamespaceItemType = 'Service';

  @Field(() => String)
  @Prop()
  displayName: string;

  @Field(() => Int, { nullable: true })
  @Prop()
  port?: number;

  @Field(() => String, { nullable: true })
  @Prop()
  domain?: string;

  @Field(() => String, { nullable: true })
  @Prop()
  image?: string;

  @Field(() => String, { nullable: true })
  @Prop()
  healthCheck?: string;

  @Field(() => NumericUsage, { defaultValue: defaultMinUsage })
  @Prop({ type: Object })
  minResources?: NumericUsage = defaultMinUsage;

  @Field(() => NumericUsage, { defaultValue: defaultMaxUsage })
  @Prop({ type: Object })
  maxResources?: NumericUsage = defaultMaxUsage;

  @Field(() => [EnvVar], { nullable: true })
  @Prop({ type: [Object], default: [] })
  env?: EnvVar[] = [];

  @Field(() => DockerRegistrySecret, { nullable: true })
  @Prop({ type: MongoID, ref: 'DockerRegistrySecret' })
  dockerRegistrySecret?: DockerRegistrySecret;

  @Field(() => Date, { nullable: true })
  @Prop({ type: Date })
  updatedAt?: Date;
}
