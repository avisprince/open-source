import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, ProjectionType, QueryOptions } from 'mongoose';

import {
  Telemetry,
  TelemetryDocument,
} from '#src/mongo/models/telemetry.model';
import { MongoID } from '#src/types/mongo.types';

@Injectable()
export class TelemetryRepository {
  constructor(
    @InjectModel(Telemetry.name)
    private readonly telemetryModel: Model<TelemetryDocument>,
  ) {}

  public create(telemetry: Partial<Telemetry>): Promise<Telemetry> {
    return this.telemetryModel.create(telemetry);
  }

  public find(
    filter: FilterQuery<TelemetryDocument>,
    projection?: ProjectionType<TelemetryDocument> | null | undefined,
    options?: QueryOptions<TelemetryDocument> | null | undefined,
  ): Promise<Telemetry[]> {
    return this.telemetryModel.find(filter, projection, options).exec();
  }

  public findByNamespaceId(
    namespaceId: MongoID | string,
  ): Promise<Telemetry[]> {
    return this.telemetryModel.find({ namespaceId });
  }

  public findById(id: MongoID): Promise<Telemetry> {
    return this.telemetryModel.findById(id).exec();
  }

  public delete(id: MongoID): Promise<Telemetry> {
    return this.telemetryModel.findByIdAndDelete(id).exec();
  }
}
