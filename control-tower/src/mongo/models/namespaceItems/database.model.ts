import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema } from '@nestjs/mongoose';

import {
  CanvasInfo,
  HealthStatus,
  NamespaceItem,
  NamespaceItemId,
} from '#src/mongo/models';
import { DatabaseBase } from '#src/mongo/models/namespaceItemBase/database.base';
import { NumericUsage } from '#src/mongo/models/telemetry.model';

@ObjectType({ implements: () => [DatabaseBase, NamespaceItem] })
@Schema({ timestamps: true })
export class Database extends DatabaseBase implements NamespaceItem {
  @Field(() => Boolean)
  isTemplate?: boolean = false;

  @Field()
  @Prop()
  itemId: NamespaceItemId;

  @Field(() => CanvasInfo)
  @Prop({ type: Object })
  canvasInfo: CanvasInfo;

  @Field(() => String, { nullable: true })
  @Prop()
  namespaceStatus?: HealthStatus;

  @Field(() => NumericUsage, { nullable: true })
  @Prop({ type: Object })
  usage?: NumericUsage;

  @Field(() => [String], { defaultValue: [], nullable: true })
  @Prop()
  errors?: string[] = [];

  static validate(database: Database): string[] {
    const errors = [];

    if (!database.displayName) {
      errors.push('MISSING_DISPLAY_NAME');
    }
    if (!database.database) {
      errors.push('MISSING_DATABASE');
    }
    if (!database.initFile) {
      errors.push('MISSING_INIT_FILE');
    }

    return errors;
  }
}
