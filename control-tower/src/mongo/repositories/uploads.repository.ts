import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';

import { Upload, UploadDocument } from '#src/mongo/models';
import { MongoID } from '#src/types/mongo.types';

@Injectable()
export class UploadsRepository {
  constructor(
    @InjectModel(Upload.name)
    private readonly uploadsModel: Model<UploadDocument>,
  ) {}

  public create(upload: Partial<Upload>): Promise<Upload> {
    return this.uploadsModel.create(upload);
  }

  public find(filter: FilterQuery<UploadDocument>): Promise<Upload[]> {
    return this.uploadsModel.find(filter).exec();
  }

  public findById(fileId: MongoID | string): Promise<Upload> {
    return this.uploadsModel.findById(fileId).exec();
  }

  public update(fileId: MongoID, file: Partial<Upload>): Promise<Upload> {
    return this.uploadsModel
      .findByIdAndUpdate(fileId, file, { new: true })
      .exec();
  }

  public delete(id: MongoID): Promise<Upload> {
    return this.uploadsModel.findByIdAndDelete(id).exec();
  }
}
