import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';

import {
  Organization,
  OrganizationDocument,
  OrganizationMember,
} from '#src/mongo/models';
import { NumericUsage } from '#src/mongo/models/telemetry.model';
import { MongoID } from '#src/types/mongo.types';

@Injectable()
export class OrganizationsRepository {
  constructor(
    @InjectModel(Organization.name)
    private readonly organizationModel: Model<OrganizationDocument>,
  ) {}

  public create(organization: Partial<Organization>): Promise<Organization> {
    return this.organizationModel.create(organization);
  }

  public findById(id: string | MongoID): Promise<Organization> {
    return this.organizationModel
      .findById(id)
      .populate(this.populateMembers())
      .exec();
  }

  public find(filter: FilterQuery<Organization>): Promise<Organization[]> {
    return this.organizationModel
      .find(filter)
      .populate(this.populateMembers())
      .exec();
  }

  public update(
    id: MongoID | string,
    organization: Partial<Organization>,
  ): Promise<Organization> {
    return this.organizationModel
      .findByIdAndUpdate(id, organization, { new: true })
      .populate(this.populateMembers())
      .exec();
  }

  public addMember(
    id: MongoID,
    member: OrganizationMember,
  ): Promise<Organization> {
    return this.organizationModel
      .findByIdAndUpdate(
        id,
        {
          $push: {
            members: member,
          },
        },
        {
          new: true,
        },
      )
      .populate(this.populateMembers())
      .exec();
  }

  public removeMember(id: MongoID, email: string): Promise<Organization> {
    return this.organizationModel
      .findByIdAndUpdate(
        id,
        {
          $pull: {
            members: { email },
          },
        },
        { new: true },
      )
      .populate(this.populateMembers())
      .exec();
  }

  public addUsage(id: string, usage: NumericUsage): Promise<Organization> {
    return this.organizationModel.findByIdAndUpdate(id, {
      $push: {
        usage: {
          $each: [
            {
              ...usage,
              timestamp: new Date(),
            },
          ],
          $position: 0,
        },
      },
    });
  }

  public delete(id: MongoID): Promise<Organization> {
    return this.organizationModel.findByIdAndDelete(id).exec();
  }

  private populateMembers() {
    return {
      path: 'members',
      populate: [
        {
          path: 'user',
          model: 'User',
        },
      ],
    };
  }
}
