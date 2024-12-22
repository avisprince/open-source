import { Module } from '@nestjs/common';

import {
  DatabaseBuilder,
  FluentdBuilder,
  IngressBuilder,
  InterceptorBuilder,
  NamespaceBuilder,
  PodBuilder,
  ProxyServiceBuilder,
  SecretsBuilder,
} from '#src/kubernetes/builders';
import { MongoBuilder } from '#src/kubernetes/builders/dbs/mongo.builder';
import { MySQLBuilder } from '#src/kubernetes/builders/dbs/mysql.builder';
import { PostgresBuilder } from '#src/kubernetes/builders/dbs/postgres.builder';
import { DnsMasqBuilder } from '#src/kubernetes/builders/dnsmasq.builder';
import { PodSpecUtil } from '#src/kubernetes/builders/utils/podSpec.util';
import { ECRClient } from '#src/kubernetes/clients/ecr.client';
import { KubernetesClient } from '#src/kubernetes/clients/kubernetes.client';
import KubeClientService from '#src/kubernetes/kubeConfig/kubeClient.service';
import { KubernetesResolver } from '#src/kubernetes/kubernetes.resolver';
import { KubernetesService } from '#src/kubernetes/kubernetes.service';
import { SubscriptionResolver } from '#src/kubernetes/subscriptions.resolver';
import TelemetryService from '#src/kubernetes/telemetry.service';
import { UploadsModule } from '#src/uploads/uploads.module';

@Module({
  imports: [UploadsModule],
  providers: [
    KubernetesResolver,
    SubscriptionResolver,
    KubernetesService,
    DnsMasqBuilder,
    FluentdBuilder,
    IngressBuilder,
    InterceptorBuilder,
    PodBuilder,
    NamespaceBuilder,
    DatabaseBuilder,
    MySQLBuilder,
    PostgresBuilder,
    MongoBuilder,
    ProxyServiceBuilder,
    SecretsBuilder,
    PodSpecUtil,
    KubernetesClient,
    ECRClient,
    TelemetryService,
    KubeClientService,
  ],
  exports: [KubernetesService, KubernetesClient, TelemetryService],
})
export class KubernetesModule {}
