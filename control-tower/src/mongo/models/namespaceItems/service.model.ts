import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema } from '@nestjs/mongoose';

import {
  CanvasInfo,
  ConsoleLog,
  HealthStatus,
  NamespaceItem,
  NamespaceItemId,
} from '#src/mongo/models';
import { ServiceBase } from '#src/mongo/models/namespaceItemBase/service.base';
import { NumericUsage } from '#src/mongo/models/telemetry.model';

@ObjectType({ implements: () => [ServiceBase, NamespaceItem] })
@Schema({ timestamps: true })
export class Service extends ServiceBase implements NamespaceItem {
  @Field(() => Boolean)
  isTemplate?: boolean = false;

  @Field(() => String)
  @Prop()
  itemId: NamespaceItemId;

  @Field(() => CanvasInfo)
  @Prop({ type: Object })
  canvasInfo: CanvasInfo;

  @Field(() => [ConsoleLog], { defaultValue: [] })
  @Prop({ type: [Object], default: [] })
  consoleLogs?: ConsoleLog[] = [];

  @Field(() => String, { nullable: true })
  @Prop()
  namespaceStatus?: HealthStatus;

  @Field(() => NumericUsage, { nullable: true })
  @Prop({ type: Object })
  usage?: NumericUsage;

  @Field(() => [String], { defaultValue: [], nullable: true })
  @Prop()
  errors?: string[];

  static validate(service: Service): string[] {
    const errors = [];

    if (!service.displayName) {
      errors.push('MISSING_DISPLAY_NAME');
    }
    if (!service.domain) {
      errors.push('MISSING_DOMAIN');
    }
    if (!service.image) {
      errors.push('MISSING_IMAGE');
    }

    return errors;
  }
}
