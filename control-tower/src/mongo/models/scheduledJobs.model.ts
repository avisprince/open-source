import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import {
  ScheduledJobData,
  ScheduledJobType,
} from '#src/constants/scheduledJobs.constants';
import { MongoID } from '#src/types/mongo.types';

@Schema({ timestamps: true, toJSON: { virtuals: true } })
export class ScheduledJob {
  id?: MongoID;

  @Prop({ type: String })
  type: ScheduledJobType;

  @Prop({ type: Object })
  data: ScheduledJobData;

  @Prop({ type: Date })
  startTime: Date;
}

export type ScheduledJobsDocument = ScheduledJob & Document;

export const ScheduledJobsSchema = SchemaFactory.createForClass(ScheduledJob);
