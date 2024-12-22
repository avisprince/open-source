import { MongoID } from '#src/types/mongo.types';

export type ScheduledJobType = 'START_TEST_RUN';

export type StartTestRunJobData = {
  testSuiteId: MongoID;
};

export type ScheduledJobData = StartTestRunJobData;
