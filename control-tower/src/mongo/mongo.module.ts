import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  Auth,
  AuthSchema,
  DockerRegistrySecret,
  DockerRegistrySecretSchema,
  Namespace,
  NamespaceItemTemplate,
  NamespaceItemTemplateSchema,
  NamespaceSchema,
  Organization,
  OrganizationSchema,
  ScheduledJob,
  ScheduledJobsSchema,
  TestRun,
  TestRunSchema,
  TestSuite,
  TestSuiteSchema,
  Upload,
  UploadSchema,
  User,
  UserSchema,
} from '#src/mongo/models';
import { Telemetry, TelemetrySchema } from '#src/mongo/models/telemetry.model';
import * as repositories from '#src/mongo/repositories';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Auth.name, schema: AuthSchema },
      { name: DockerRegistrySecret.name, schema: DockerRegistrySecretSchema },
      { name: Namespace.name, schema: NamespaceSchema },
      { name: NamespaceItemTemplate.name, schema: NamespaceItemTemplateSchema },
      { name: Organization.name, schema: OrganizationSchema },
      { name: ScheduledJob.name, schema: ScheduledJobsSchema },
      { name: Telemetry.name, schema: TelemetrySchema },
      { name: TestRun.name, schema: TestRunSchema },
      { name: TestSuite.name, schema: TestSuiteSchema },
      { name: Upload.name, schema: UploadSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [...Object.values(repositories)],
  exports: [...Object.values(repositories)],
})
export class MongoModule {}
