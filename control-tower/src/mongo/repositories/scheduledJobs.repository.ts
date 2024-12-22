import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';

import { ScheduledJob, ScheduledJobsDocument } from '#src/mongo/models';
import { MongoID } from '#src/types/mongo.types';

@Injectable()
export class ScheduledJobsRepository {
  constructor(
    @InjectModel(ScheduledJob.name)
    private readonly scheduledJobsModel: Model<ScheduledJobsDocument>,
  ) {}

  public create(job: ScheduledJob): Promise<ScheduledJob> {
    return this.scheduledJobsModel.create(job);
  }

  public findOne(
    filter: FilterQuery<ScheduledJobsDocument>,
  ): Promise<ScheduledJob> {
    return this.scheduledJobsModel.findOne(filter).exec();
  }

  public getAll(): Promise<ReadonlyArray<ScheduledJob>> {
    return this.scheduledJobsModel
      .find({ startTime: { $lt: new Date() } })
      .exec();
  }

  public update(
    id: MongoID,
    job: Partial<ScheduledJob>,
  ): Promise<ScheduledJob> {
    return this.scheduledJobsModel
      .findByIdAndUpdate(id, { $set: job }, { new: true })
      .exec();
  }

  public delete(id: MongoID): Promise<ScheduledJob> {
    return this.scheduledJobsModel.findByIdAndDelete(id).exec();
  }

  public async findAndDeleteJob(
    filter: FilterQuery<ScheduledJobsDocument>,
  ): Promise<void> {
    await this.scheduledJobsModel.findOneAndDelete(filter).exec();
  }
}
