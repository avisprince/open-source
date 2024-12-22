import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';

import { TestRun, TestRunDocument, TestRunTestCase } from '#src/mongo/models';
import { MongoID } from '#src/types/mongo.types';

@Injectable()
export class TestRunsRepository {
  constructor(
    @InjectModel(TestRun.name)
    private readonly testRunModel: Model<TestRunDocument>,
  ) {}

  public create(testRun: Partial<TestRun>): Promise<TestRun> {
    return this.testRunModel.create(testRun);
  }

  public findById(id: MongoID): Promise<TestRun> {
    return this.testRunModel.findById(id).exec();
  }

  public find(filter: FilterQuery<TestRunDocument>): Promise<TestRun[]> {
    return this.testRunModel.find(filter).exec();
  }

  public async endTestRun(
    id: MongoID,
    testCases: TestRunTestCase[],
  ): Promise<TestRun> {
    return this.testRunModel
      .findByIdAndUpdate(
        id,
        {
          testCases,
          success: !testCases.some(t => !t.success),
          endTime: new Date(),
        },
        { new: true },
      )
      .exec();
  }

  public addNamespaces(id: MongoID, namespaceIds: MongoID[]): Promise<TestRun> {
    return this.testRunModel
      .findByIdAndUpdate(
        id,
        {
          $push: {
            namespaces: { $each: namespaceIds },
          },
        },
        { new: true },
      )
      .exec();
  }

  public delete(id: MongoID): Promise<TestRun> {
    return this.testRunModel.findByIdAndDelete(id).exec();
  }
}
