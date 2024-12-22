import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Dictionary, isArray } from 'lodash';
import { Document } from 'mongoose';

import { CloudStatus } from '#src/constants/cloudStatus.constants';
import {
  Action,
  Database,
  DbQuery,
  HttpRequest,
  MockEndpoint,
  NamespaceItem,
  QueryHistory,
  QueryLog,
  Service,
  TestCase,
  TrafficHistory,
  User,
} from '#src/mongo/models';
import { NamespaceTraffic } from '#src/mongo/models/namespaceTraffic/namespaceTraffic.interface';
import { HasPermissions } from '#src/mongo/models/permissions.model';
import { NumericUsage } from '#src/mongo/models/telemetry.model';
import { MongoID } from '#src/types/mongo.types';

export type NamespaceType = 'sandbox' | 'testRun';
export type HealthStatus = 'loading' | 'running' | 'crashed';

export const defaultMinUsage: NumericUsage = {
  cpu: 200,
  memory: 250,
};

export const defaultMaxUsage: NumericUsage = {
  cpu: 800,
  memory: 1000,
};

@ObjectType()
export class ServiceStatus {
  @Field()
  @Prop()
  name: string;

  @Field({ nullable: true })
  @Prop()
  status?: HealthStatus;

  @Field(() => NumericUsage, { nullable: true })
  @Prop({ type: Object })
  usage?: NumericUsage;
}

@ObjectType()
export class ActiveUser {
  @Field()
  @Prop()
  peerId: string;

  @Field(() => User)
  @Prop({ type: String, ref: 'User' })
  user: User | MongoID;

  @Field()
  @Prop()
  color: string;

  @Field(() => Date)
  @Prop({ type: Date })
  heartbeat: Date;
}

@ObjectType()
export class NamespaceHealth {
  @Field({ nullable: true })
  @Prop()
  status?: HealthStatus;

  @Field(() => [ServiceStatus])
  @Prop({ type: [Object], default: [] })
  serviceStatus: ServiceStatus[];

  @Field(() => NumericUsage, { nullable: true })
  @Prop({ type: Object })
  usage?: NumericUsage;
}

@ObjectType()
@Schema({ timestamps: true, toJSON: { virtuals: true } })
export class Namespace extends HasPermissions {
  @Field(() => ID)
  id: MongoID;

  @Field(() => String)
  @Prop()
  name: string;

  @Field(() => String)
  @Prop({ index: true, unique: false })
  type: NamespaceType;

  @Field(() => [Service], { defaultValue: [] })
  services: Service[] = [];

  @Field(() => [Database], { defaultValue: [] })
  databases: Database[] = [];

  @Field(() => [HttpRequest], { defaultValue: [] })
  httpRequests: HttpRequest[] = [];

  @Field(() => [MockEndpoint], { defaultValue: [] })
  mockEndpoints: MockEndpoint[] = [];

  @Field(() => [DbQuery], { defaultValue: [] })
  dbQueries: DbQuery[] = [];

  @Field(() => [TrafficHistory], { defaultValue: [] })
  trafficHistories: TrafficHistory[] = [];

  @Field(() => [QueryHistory], { defaultValue: [] })
  queryHistories: QueryHistory[] = [];

  @Field(() => [NamespaceItem])
  @Prop({ type: [Object], default: [] })
  items: Array<
    | Service
    | Database
    | HttpRequest
    | MockEndpoint
    | DbQuery
    | TrafficHistory
    | QueryHistory
  > = [];

  @Field(() => [Action], { defaultValue: [] })
  actions: Action[] = [];

  @Field(() => [QueryLog], { defaultValue: [] })
  queries: QueryLog[] = [];

  @Field(() => [NamespaceTraffic])
  @Prop({ type: [Object], default: [] })
  traffic: Array<Action | QueryLog> = [];

  @Field(() => Date, { nullable: true })
  @Prop({ type: Date })
  createdAt?: Date;

  @Field(() => Date, { nullable: true })
  @Prop({ type: Date })
  updatedAt?: Date;

  @Field(() => Date, { nullable: true })
  @Prop({ type: Date })
  lastUsedAt?: Date;

  @Field(() => ID, { nullable: true })
  @Prop()
  templateId?: MongoID;

  @Field(() => ID, { nullable: true })
  @Prop()
  testRunId?: MongoID;

  @Field()
  @Prop({ type: String, default: CloudStatus.INACTIVE })
  status: CloudStatus;

  @Field(() => [TestCase], { defaultValue: [] })
  @Prop({ type: [Object], default: [] })
  testCases: TestCase[];

  @Field(() => [ActiveUser], { defaultValue: [] })
  @Prop({ type: [Object], default: [] })
  activeUsers: ActiveUser[];

  @Field(() => NumericUsage, { nullable: true })
  @Prop({ type: Object })
  usage?: NumericUsage;

  @Field(() => NumericUsage)
  maxItemResources: NumericUsage;

  @Field(() => Boolean)
  @Prop({ type: Boolean })
  isArchived: boolean;
}

export type NamespaceDocument = Namespace & Document;

export const NamespaceSchema = SchemaFactory.createForClass(Namespace);

const namespaceDomainCount = (namespace: Namespace): Dictionary<number> => {
  const services: Service[] = namespace.items.filter(
    item => item.itemType === 'Service',
  );

  return services
    .filter(service => service.domain !== null)
    .map(service => service.domain)
    .reduce((agg, domain) => {
      const count = agg[domain] ?? 0;
      return {
        ...agg,
        [domain]: count + 1,
      };
    }, {});
};

const populate = (doc: Namespace | Array<Namespace>) => {
  const namespaces = isArray(doc) ? doc : [doc];
  namespaces
    .filter(ns => !!ns)
    .forEach(namespace => {
      const domainCount = namespaceDomainCount(namespace);

      namespace.items.forEach(item => {
        if (item.itemType === 'Service' || item.itemType === 'Database') {
          const service = item as Service;
          namespace.maxItemResources = {
            cpu:
              (namespace.maxItemResources?.cpu ?? 0) +
              (service.maxResources?.cpu || defaultMaxUsage.cpu),
            memory:
              (namespace.maxItemResources?.memory ?? 0) +
              (service.maxResources?.memory || defaultMaxUsage.memory),
          };
        }

        if (item.itemType === 'Service') {
          const service = item as Service;
          service.errors = Service.validate(service);
          if (domainCount[service.domain] > 1) {
            service.errors.push('DOMAIN_NOT_UNIQUE');
          }
        }
        if (item.itemType === 'Database') {
          (item as Database).errors = Database.validate(item);
        }
        if (item.itemType === 'MockEndpoint') {
          (item as MockEndpoint).errors = MockEndpoint.validate(item);
        }
      });

      namespace.databases = namespace.items.filter(
        item => item.itemType === 'Database',
      );
      namespace.services = namespace.items.filter(
        item => item.itemType === 'Service',
      );
      namespace.httpRequests = namespace.items.filter(
        item => item.itemType === 'HttpRequest',
      );
      namespace.mockEndpoints = namespace.items.filter(
        item => item.itemType === 'MockEndpoint',
      );
      namespace.dbQueries = namespace.items.filter(
        item => item.itemType === 'DbQuery',
      );
      namespace.trafficHistories = namespace.items.filter(
        item => item.itemType === 'TrafficHistory',
      );
      namespace.queryHistories = namespace.items.filter(
        item => item.itemType === 'QueryHistory',
      );

      namespace.actions = namespace.traffic.filter(
        (traffic): traffic is Action => traffic.trafficType === 'Action',
      );
      namespace.queries = namespace.traffic.filter(
        (traffic): traffic is QueryLog => traffic.trafficType === 'Query',
      );
    });
};

NamespaceSchema.post('save', populate);
NamespaceSchema.post(
  [
    'find',
    'findOne',
    'findOneAndDelete',
    'findOneAndRemove',
    'findOneAndUpdate',
    'updateOne',
  ],
  populate,
);
