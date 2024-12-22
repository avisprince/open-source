import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { GraphQLError } from 'graphql';
import { join } from 'path';

import { ActionLoggerModule } from '#src/actionLogger/actionLogger.module';
import { AdminModule } from '#src/admin/admin.module';
import { AppController } from '#src/app.controller';
import { AppLogger } from '#src/app.logger';
import { AuthModule } from '#src/auth/auth.module';
import { ENVIRONMENT } from '#src/constants/environment.constants';
import { KubernetesModule } from '#src/kubernetes/kubernetes.module';
import { MongoModule } from '#src/mongo/mongo.module';
import { NamespaceItemTemplatesModule } from '#src/namespaceItemTemplates/namespaceItemTemplates.module';
import { NamespacesModule } from '#src/namespaces/namespaces.module';
import { OrganizationsModule } from '#src/organizations/organizations.module';
import { PubSubModule } from '#src/pubsub/pubsub.module';
import { DateTimeScalar } from '#src/scalars/dateTime.scalar';
import { ScheduledJobsModule } from '#src/scheduledJobs/scheduledJobs.module';
import { SecretsModule } from '#src/secrets/secrets.module';
import { TestingModule } from '#src/testing/testing.module';
import { UploadsModule } from '#src/uploads/uploads.module';
import { UserModule } from '#src/users/user.module';
import { WebsocketsModule } from '#src/websockets/websockets.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV || ENVIRONMENT.LOCAL}`],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          uri: configService.get<string>('MONGO_CONNECTION_STRING'),
          user: configService.get<string>('MONGO_USERNAME'),
          pass: configService.get<string>('MONGO_PASSWORD'),
          dbName: 'controlTower',
          tlsInsecure: true,
        };
      },
    }),
    ScheduleModule.forRoot(),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      autoSchemaFile: join(process.cwd(), 'src/../../shared/schema.graphql'),
      sortSchema: true,
      playground: true,
      driver: ApolloDriver,
      subscriptions: { 'graphql-ws': true },
      formatError: (error: GraphQLError) => {
        const logger = new AppLogger();
        const { message, locations, path, extensions } = error;
        logger.error(
          message,
          extensions.code as string | undefined,
          JSON.stringify(extensions.stacktrace),
        );

        return {
          message,
          locations,
          path,
          extensions,
        };
      },
      // subscriptions: {
      //   'graphql-ws': {
      //     onConnect: (context: Context<any>) => {
      //       const { connectionParams, extra } = context;
      //       // user validation will remain the same as in the example above
      //       // when using with graphql-ws, additional context value should be stored in the extra field
      //       extra.user = { user: {} };
      //     },
      //   },
      // },
      // context: ({ extra }) => {
      //   // you can now access your additional context value through the extra field
      // },
    }),
    DateTimeScalar,
    AdminModule,
    AuthModule,
    MongoModule,
    PubSubModule,
    SecretsModule,
    UploadsModule,
    ActionLoggerModule,
    NamespacesModule,
    NamespaceItemTemplatesModule,
    KubernetesModule,
    UserModule,
    ScheduledJobsModule,
    TestingModule,
    WebsocketsModule,
    OrganizationsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
