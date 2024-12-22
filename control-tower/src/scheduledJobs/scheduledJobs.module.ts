import { Module } from '@nestjs/common';

import { KubernetesModule } from '#src/kubernetes/kubernetes.module';
import { ScheduledJobsService } from '#src/scheduledJobs/scheduledJobs.service';
import { TestingModule } from '#src/testing/testing.module';

@Module({
  imports: [KubernetesModule, TestingModule],
  providers: [ScheduledJobsService],
})
export class ScheduledJobsModule {}
