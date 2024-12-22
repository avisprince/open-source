import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';

import { User, UserDocument } from '#src/mongo/models';
import { MongoID } from '#src/types/mongo.types';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  public create(user: Partial<User>): Promise<User> {
    return this.userModel.create(user);
  }

  public findByEmail(email: string, populate = false): Promise<User> {
    const user = this.userModel.findOne({ email });

    if (populate) {
      user.populate('organizations');
    }

    return user.exec();
  }

  public find(filter: FilterQuery<User>): Promise<User[]> {
    return this.userModel.find(filter).exec();
  }

  public update(email: string, update: Partial<User>): Promise<User> {
    return this.userModel
      .findOneAndUpdate({ email }, update, { new: true })
      .exec();
  }

  public addOrg(email: string, organizationId: MongoID): Promise<User> {
    return this.userModel
      .findOneAndUpdate(
        { email },
        {
          $push: {
            organizations: organizationId,
          },
        },
        { new: true },
      )
      .exec();
  }

  public removeOrg(email: string, organizationId: MongoID): Promise<User> {
    return this.userModel
      .findOneAndUpdate(
        { email },
        {
          $pull: {
            organizations: organizationId,
          },
        },
        { new: true },
      )
      .exec();
  }
}
