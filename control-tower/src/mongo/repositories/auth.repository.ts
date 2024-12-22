import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Auth, AuthDocument } from '#src/mongo/models';

@Injectable()
export class AuthRepository {
  constructor(
    @InjectModel(Auth.name) private readonly authModel: Model<AuthDocument>,
  ) {}

  public create(auth: Partial<Auth>): Promise<Auth> {
    return this.authModel.create(auth);
  }

  public async findByAccessToken(accessToken: string): Promise<Auth> {
    const results = await this.authModel
      .find({ accessToken })
      .populate('user')
      .exec();

    return results[0];
  }
}
