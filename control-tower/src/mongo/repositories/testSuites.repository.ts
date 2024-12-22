import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';

import { SuccessRate, TestSuite, TestSuiteDocument } from '#src/mongo/models';
import { TestSuiteInput } from '#src/resolverInputs/testSuite.input';
import { MongoID } from '#src/types/mongo.types';

@Injectable()
export class TestSuitesRepository {
  constructor(
    @InjectModel(TestSuite.name)
    private readonly testSuiteModel: Model<TestSuiteDocument>,
  ) {}

  public create(testSuite: Partial<TestSuite>): Promise<TestSuite> {
    return this.testSuiteModel.create(testSuite);
  }

  public findById(id: MongoID | string): Promise<TestSuite> {
    return this.testSuiteModel
      .findById(id)
      .populate('namespaces')
      .populate('testRuns')
      .exec();
  }

  public find(filter: FilterQuery<TestSuiteDocument>): Promise<TestSuite[]> {
    return this.testSuiteModel
      .find(filter)
      .populate('namespaces')
      .populate('testRuns')
      .exec();
  }

  public update(
    id: MongoID,
    testSuite: Partial<TestSuite> | TestSuiteInput,
  ): Promise<TestSuite> {
    return this.testSuiteModel
      .findByIdAndUpdate(id, testSuite, { new: true })
      .populate('namespaces')
      .populate('testRuns')
      .exec();
  }

  public addTestRun(
    testSuiteId: MongoID,
    testRunId: MongoID,
  ): Promise<TestSuite> {
    return this.testSuiteModel
      .findByIdAndUpdate(
        testSuiteId,
        {
          $push: {
            testRuns: {
              $each: [testRunId],
              $position: 0,
            },
          },
        },
        { new: true },
      )
      .populate('namespaces')
      .populate('testRuns')
      .exec();
  }

  public updateSuccessRate(
    testSuiteId: MongoID,
    successRate: number,
    testCaseSuccessRates: SuccessRate[],
    namespaceSuccessRates: SuccessRate[],
  ): Promise<TestSuite> {
    return this.testSuiteModel
      .findByIdAndUpdate(
        testSuiteId,
        {
          $inc: { numberOfRuns: 1 },
          successRate,
          testCaseSuccessRates,
          namespaceSuccessRates,
        },
        { new: true },
      )
      .populate('namespaces')
      .populate('testRuns')
      .exec();
  }

  public delete(id: MongoID): Promise<TestSuite> {
    return this.testSuiteModel.findByIdAndDelete(id).exec();
  }
}
