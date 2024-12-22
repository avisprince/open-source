import { Module } from '@nestjs/common';

import { KubernetesModule } from '#src/kubernetes/kubernetes.module';
import { TestingResolver } from '#src/testing/testing.resolver';
import { TestingService } from '#src/testing/testing.service';
import { TestSuiteRunner } from '#src/testing/testSuite.runner';

@Module({
  imports: [KubernetesModule],
  providers: [TestingResolver, TestingService, TestSuiteRunner],
  exports: [TestingService, TestSuiteRunner],
})
export class TestingModule {}
