import { Injectable, Logger } from '@nestjs/common';
import dayjs from 'dayjs';
import * as fs from 'fs';
import { existsSync, mkdirSync } from 'fs';
import { Dictionary } from 'lodash';
import * as util from 'util';

import { DOKKIMI_LOCAL_FILES } from '#src/app.contants';
import { CloudStatus } from '#src/constants/cloudStatus.constants';
import { BOOLEAN, DOKKIMI } from '#src/constants/environment.constants';
import { CRASHED, LOADING, RUNNING } from '#src/constants/namespace.constants';
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
import { KubernetesClient } from '#src/kubernetes/clients/kubernetes.client';
import KubeClientService from '#src/kubernetes/kubeConfig/kubeClient.service';
import TelemetryService from '#src/kubernetes/telemetry.service';
import {
  DockerRegistrySecret,
  HealthStatus,
  Namespace,
  NamespaceHealth,
  NamespaceItem,
  ServiceStatus,
} from '#src/mongo/models';
import { NumericUsage } from '#src/mongo/models/telemetry.model';
import { NamespacesRepository } from '#src/mongo/repositories';
import { PubSubService } from '#src/pubsub/pubsub.service';
import { MongoID } from '#src/types/mongo.types';
import { NamespaceUsageFile, PodStatus } from '#src/uploads/uploads.types';
import sleep from '#src/utils/sleep';

@Injectable()
export class KubernetesService {
  private readonly logger = new Logger(KubernetesService.name);

  constructor(
    private readonly namespacesRepository: NamespacesRepository,
    private readonly fluentdBuilder: FluentdBuilder,
    private readonly ingressBuilder: IngressBuilder,
    private readonly interceptorBuilder: InterceptorBuilder,
    private readonly namespaceBuilder: NamespaceBuilder,
    private readonly podBuilder: PodBuilder,
    private readonly proxyServiceBuilder: ProxyServiceBuilder,
    private readonly databaseBuilder: DatabaseBuilder,
    private readonly pubsubService: PubSubService,
    private readonly secretsBuilder: SecretsBuilder,
    private readonly kubernetesClient: KubernetesClient,
    private readonly kubeClientService: KubeClientService,
    private readonly telemetryService: TelemetryService,
  ) {}

  public async startNamespace(namespaceId: MongoID): Promise<Namespace> {
    console.log('1');
    const kubeClientFactory =
      await this.kubeClientService.getKubeClientFactory();

    console.log('1.5');

    if (process.env.ENABLE_METRICS === BOOLEAN.TRUE) {
      const { cpu, memory } = await this.telemetryService.getClusterUsage(
        kubeClientFactory,
      );

      if (cpu >= 0.95 || memory >= 0.95) {
        this.logger.warn(
          'Cannot start namespace. CPU and memory usage too high.',
        );
        return;
      }
    }
    console.log('2');

    let namespace = await this.namespacesRepository.findById(namespaceId);
    console.log('3');

    await this.namespaceBuilder.build(kubeClientFactory, namespaceId);
    console.log('4');
    await this.secretsBuilder.build(kubeClientFactory, namespaceId, DOKKIMI, {
      repository: 'Docker',
      auth: Buffer.from(
        `${DOKKIMI}:${process.env.DOKKIMI_DOCKER_HUB_ACCESS_TOKEN}`,
      ).toString('base64'),
    } as DockerRegistrySecret);
    console.log('5');
    await this.interceptorBuilder.build(
      kubeClientFactory,
      namespaceId.toString(),
      DOKKIMI,
      DOKKIMI,
    );
    console.log('6');
    // await this.fluentdBuilder.build(kubeClientFactory, namespaceId);
    await this.proxyServiceBuilder.build(kubeClientFactory, namespace);
    console.log('7');
    await this.ingressBuilder.build(kubeClientFactory, namespace);
    console.log('8');

    // Update DB
    namespace = await this.namespacesRepository.update(namespaceId, {
      status: CloudStatus.ACTIVE,
      lastUsedAt: new Date(),
    });
    console.log('9');

    await this.startNamespaceItems(namespace, namespace.items);
    console.log('10');
    return this.namespacesRepository.findById(namespaceId);
  }

  public async startNamespaceItem(
    namespaceId: MongoID,
    itemId: string,
  ): Promise<void> {
    const namespace = await this.namespacesRepository.findById(namespaceId);
    const item = namespace.items.find(item => item.itemId === itemId);

    await this.startNamespaceItems(namespace, [item]);
  }

  public async startNamespaceItems(
    namespace: Namespace,
    items: NamespaceItem[],
  ): Promise<void> {
    try {
      if (namespace.status !== CloudStatus.ACTIVE) {
        return;
      }

      const kubeClientFactory =
        await this.kubeClientService.getKubeClientFactory();

      await Promise.all(
        items
          .filter(
            item =>
              !!item &&
              item.errors?.length === 0 &&
              item.itemType === 'Database',
          )
          .map(async item => {
            await this.databaseBuilder.build(
              kubeClientFactory,
              namespace.id,
              item,
            );
            await this.namespacesRepository.updateItem(namespace.id, {
              ...item,
              namespaceStatus: 'loading',
            });
          }),
      );

      await Promise.all(
        items
          .filter(
            item =>
              !!item &&
              item.errors?.length === 0 &&
              item.itemType === 'Service',
          )
          .map(async item => {
            await this.podBuilder.build(kubeClientFactory, namespace, item);
            await this.namespacesRepository.updateItem(namespace.id, {
              ...item,
              namespaceStatus: 'loading',
            });
          }),
      );

      await this.kubernetesClient.updateProxyServiceUrlMap(namespace);
      await this.checkNamespaceHealthAndUsage(namespace.id);
    } catch (err) {
      this.logger.error(err.message);
    }
  }

  public async patchNamespaceItem(
    namespace: Namespace,
    item: NamespaceItem,
  ): Promise<void> {
    try {
      if (namespace.status !== CloudStatus.ACTIVE) {
        return;
      }

      if (item.itemType === 'MockEndpoint') {
        await this.kubernetesClient.updateMockEndpoints(namespace);
      }
    } catch (err) {
      this.logger.error(err.message);
    }
  }

  public async terminateNamespaceItem(
    namespaceId: MongoID,
    itemId: string,
  ): Promise<void> {
    try {
      const namespace = await this.namespacesRepository.findById(namespaceId);

      if (namespace.status !== CloudStatus.ACTIVE) {
        return;
      }

      const item = namespace.items.find(i => i.itemId === itemId);
      const kubeClientFactory =
        await this.kubeClientService.getKubeClientFactory();

      if (item.itemType === 'Service') {
        await this.podBuilder.destroy(kubeClientFactory, namespaceId, item);
      } else if (item.itemType === 'Database') {
        await this.databaseBuilder.destroy(
          kubeClientFactory,
          namespaceId.toString(),
          item.itemId,
        );
      }

      await this.namespacesRepository.updateItem(namespaceId, {
        ...item,
        namespaceStatus: 'loading',
      });
      await this.checkNamespaceHealthAndUsage(namespaceId);
      await this.kubernetesClient.updateProxyServiceUrlMap(namespace);
    } catch (err) {
      this.logger.error(
        `Failed to delete namespace item: ${itemId} in namespace: ${namespaceId}`,
      );
      this.logger.error(err.message);
    }
  }

  public async terminateNamespace(namespaceId: MongoID): Promise<Namespace> {
    const { services, databases, items } =
      await this.namespacesRepository.findById(namespaceId);
    const kubeClientFactory =
      await this.kubeClientService.getKubeClientFactory();

    try {
      await Promise.all([
        this.secretsBuilder.destroy(kubeClientFactory, namespaceId, DOKKIMI),
        this.interceptorBuilder.destroy(
          kubeClientFactory,
          namespaceId.toString(),
          DOKKIMI,
        ),
        ...services
          .filter(service => service.namespaceStatus)
          .map(service =>
            this.podBuilder.destroy(kubeClientFactory, namespaceId, service),
          ),
        ...databases
          .filter(db => db.namespaceStatus)
          .map(database =>
            this.databaseBuilder.destroy(
              kubeClientFactory,
              namespaceId.toString(),
              database.itemId,
            ),
          ),
        this.proxyServiceBuilder.destroy(kubeClientFactory, namespaceId),
        this.ingressBuilder.destroy(kubeClientFactory, namespaceId),
        // this.fluentdBuilder.destroy(kubeClientFactory, namespaceId),
        this.namespaceBuilder.destroy(kubeClientFactory, namespaceId),
      ]);

      return this.namespacesRepository.update(namespaceId, {
        status: CloudStatus.TERMINATING,
        items: items.map(item => ({
          ...item,
          namespaceStatus:
            item.itemType === 'Service' || item.itemType === 'Database'
              ? 'loading'
              : null,
        })),
      });
    } catch (e) {
      this.logger.error(`Failed to delete namespace: ${namespaceId}`);
      this.logger.error(e.message);
    } finally {
      await this.namespaceBuilder.destroy(kubeClientFactory, namespaceId);
    }
  }

  public async checkNamespaceHealthAndUsageOld(
    namespaceId: MongoID,
  ): Promise<NamespaceHealth> {
    try {
      const namespace = await this.namespacesRepository.findById(namespaceId);
      if (namespace.status === CloudStatus.INACTIVE) {
        return;
      }

      const kubeClientFactory =
        await this.kubeClientService.getKubeClientFactory();
      const k8sApi = kubeClientFactory.getCoreV1ApiClient();
      const { body: podList } = await k8sApi.listNamespacedPod(
        namespaceId.toString(),
      );

      const metrics = kubeClientFactory.getMetricsClient();
      const podMetricsList = await metrics.getPodMetrics(
        namespaceId.toString(),
      );

      const isTerminating = namespace.status === CloudStatus.TERMINATING;
      const namespaceStatuses: Dictionary<PodStatus> = {};

      // build full object
      podMetricsList.items.forEach(metric => {
        metric.containers.forEach(({ name, usage }) => {
          if (!namespaceStatuses[name]) {
            namespaceStatuses[name] = { name };
          }

          namespaceStatuses[name].cpu = this.telemetryService.cpuParser(
            usage.cpu,
          );
          namespaceStatuses[name].memory = this.telemetryService.memoryParser(
            usage.memory,
          );
        });
      });
      podList.items.forEach(podInfo => {
        if (!podInfo?.status?.containerStatuses) {
          return;
        }

        const containerStatus = podInfo.status.containerStatuses[0];
        const name = containerStatus.name;

        if (!namespaceStatuses[name]) {
          namespaceStatuses[name] = { name };
        }

        if (containerStatus.state.running) {
          namespaceStatuses[name].status =
            isTerminating || !containerStatus.ready ? 'loading' : 'running';
        } else if (containerStatus.state.waiting) {
          namespaceStatuses[name].status = 'loading';
        } else {
          namespaceStatuses[name].status = 'crashed';
        }
      });

      // build condensed object to send to client
      const statuses = Object.values(namespaceStatuses);
      const namespaceHealth: NamespaceHealth = {
        status: this.calculateStatus(statuses, isTerminating),
        usage: this.calculateUsage(statuses),
        serviceStatus: [],
      };

      const itemIds = new Set(namespace.items.map(item => item.itemId));
      const groupedStatuses = statuses.reduce<Dictionary<PodStatus[]>>(
        (agg, podStatus) => {
          const itemId = podStatus.name.split('-')[0];
          if (itemIds.has(itemId)) {
            agg[itemId] = (agg[itemId] || []).concat(podStatus);
          }
          return agg;
        },
        {},
      );

      namespaceHealth.serviceStatus = Object.entries(
        groupedStatuses,
      ).map<ServiceStatus>(([name, statuses]) => {
        return {
          name,
          status: this.calculateStatus(statuses, isTerminating),
          usage: this.calculateUsage(statuses),
        };
      });

      /**
       * When there are no more services in the namespace, we can
       * check if the namespace has fully terminated.
       */
      if (!podList.items.length) {
        await this.saveAndPublishNamespaceHealth(namespaceId, {
          ...namespaceHealth,
          status: 'loading',
        });

        await new Promise<void>(resolve => {
          const interval = setInterval(async () => {
            /**
             * When readNamespaceStatus fails, the namespace has fully
             * terminated and we can resolve the promise.
             */
            try {
              await k8sApi.readNamespaceStatus(namespaceId.toString());
            } catch (err) {
              resolve();
              clearInterval(interval);
              clearTimeout(timeout);

              namespaceHealth.serviceStatus = Array.from(itemIds).map(id => ({
                name: id,
                status: null,
                usage: null,
              }));
            }
          }, 1000);

          const timeout = setTimeout(() => {
            resolve();
            clearInterval(interval);
          }, 10000);
        });
      }

      await this.saveAndPublishNamespaceHealth(namespaceId, namespaceHealth);
      return namespaceHealth;
    } catch (err) {
      this.logger.error(err);
    }
  }

  public async checkNamespaceHealthAndUsage(
    namespaceId: MongoID,
  ): Promise<NamespaceHealth> {
    const defaultNamespaceHealth: NamespaceHealth = {
      status: null,
      serviceStatus: [],
      usage: this.calculateUsage([]),
    };

    try {
      const namespace = await this.namespacesRepository.findById(namespaceId);
      if (namespace.status === CloudStatus.INACTIVE) {
        return defaultNamespaceHealth;
      }

      const itemIds = new Set(namespace.items.map(item => item.itemId));
      const isTerminating = namespace.status === CloudStatus.TERMINATING;
      if (isTerminating) {
        const isFullyTerminated =
          await this.telemetryService.isNamespaceTerminated(namespace);

        if (isFullyTerminated) {
          defaultNamespaceHealth.serviceStatus = Array.from(itemIds).map(
            id => ({
              name: id,
              status: null,
              usage: null,
            }),
          );

          await this.saveAndPublishNamespaceHealth(
            namespace.id,
            defaultNamespaceHealth,
          );
          return defaultNamespaceHealth;
        }
      }

      const now = new Date();

      const year = now.getUTCFullYear();
      const month = String(now.getUTCMonth() + 1).padStart(2, '0');
      const day = String(now.getUTCDate()).padStart(2, '0');

      const today = `${year}-${month}-${day}`;
      const readFile = util.promisify(fs.readFile);
      const path = `${DOKKIMI_LOCAL_FILES}/namespaces/${namespaceId}/usage`;
      if (!existsSync(path)) {
        mkdirSync(path, { recursive: true });
      }

      const data = await readFile(`${path}/${today}.txt`, 'utf8');
      const lines = data.split('\n').filter(l => l.trim() !== '');
      const lastLine = lines[lines.length - 1];
      const namespaceUsage: NamespaceUsageFile = JSON.parse(lastLine);

      if (
        !namespaceUsage ||
        !this.isWithinNSeconds(namespaceUsage.lastUpdated, 15)
      ) {
        return defaultNamespaceHealth;
      }

      const namespaceStatuses =
        namespaceUsage.history[namespaceUsage.history.length - 1];

      // build condensed object to send to client
      const statuses = Object.values(namespaceStatuses);
      const namespaceHealth: NamespaceHealth = {
        status: isTerminating ? 'loading' : namespaceUsage.status,
        usage: this.calculateUsage(statuses),
        serviceStatus: [],
      };

      const groupedStatuses = statuses.reduce<Dictionary<PodStatus[]>>(
        (agg, podStatus) => {
          const itemId = podStatus.name.split('-')[0];
          if (itemIds.has(itemId)) {
            agg[itemId] = (agg[itemId] || []).concat(podStatus);
          }
          return agg;
        },
        {},
      );

      namespaceHealth.serviceStatus = Object.entries(
        groupedStatuses,
      ).map<ServiceStatus>(([name, statuses]) => {
        return {
          name,
          status: this.calculateStatus(statuses, isTerminating),
          usage: this.calculateUsage(statuses),
        };
      });

      await this.saveAndPublishNamespaceHealth(namespaceId, namespaceHealth);
      return namespaceHealth;
    } catch (err) {
      this.logger.error(err);
    }
  }

  public async waitForServices(namespaceId: MongoID): Promise<NamespaceHealth> {
    let namespaceHealth: NamespaceHealth;

    while (!namespaceHealth || namespaceHealth.status !== CRASHED) {
      try {
        namespaceHealth = await this.checkNamespaceHealthAndUsage(namespaceId);
        if (namespaceHealth.status === RUNNING) {
          if (
            !namespaceHealth.serviceStatus.some(
              status => status.status === LOADING,
            )
          ) {
            break;
          }
        }
      } catch {
        // Proxy Service is most likely not loaded. Try again.
      }

      await sleep(1000);
    }

    return namespaceHealth;
  }

  public async getItemIdFromIp(
    namespaceId: string,
    ip: string,
  ): Promise<string> {
    const namespace = await this.namespacesRepository.findById(namespaceId);
    if (namespace.status === CloudStatus.INACTIVE) {
      return;
    }

    const kubeClientFactory =
      await this.kubeClientService.getKubeClientFactory();
    const k8sApi = kubeClientFactory.getCoreV1ApiClient();
    const { body: podList } = await k8sApi.listNamespacedPod(
      namespaceId.toString(),
    );

    const pod = podList.items.find(pod => pod.status.podIP === ip);
    if (pod) {
      const appName = pod.metadata.labels.app;
      return appName === 'proxy-service' ? DOKKIMI : appName.split('-pod-')[0];
    }

    return;
  }

  private async saveAndPublishNamespaceHealth(
    namespaceId: MongoID,
    namespaceHealth: NamespaceHealth,
  ): Promise<void> {
    const namespace = await this.namespacesRepository.findById(namespaceId);
    [...namespace.services, ...namespace.databases].forEach(item => {
      const status = namespaceHealth.serviceStatus.find(
        service => service.name === item.itemId,
      );
      if (!status) {
        namespaceHealth.serviceStatus.push({
          name: item.itemId,
          status: null,
          usage: null,
        });
      }
    });

    const isInactive = namespaceHealth.status === null;

    await this.namespacesRepository.update(namespaceId, {
      status: isInactive ? CloudStatus.INACTIVE : namespace.status,
      items: namespace.items.map(item => {
        const namespaceStatus =
          namespaceHealth.serviceStatus.find(
            status => status.name === item.itemId,
          )?.status ?? null;
        const usage =
          namespaceHealth.serviceStatus.find(
            status => status.name === item.itemId,
          )?.usage ?? null;

        return {
          ...item,
          namespaceStatus,
          usage,
        };
      }),
    });

    await this.pubsubService.publish('namespaceHealth', {
      orgId: namespace.permissions.organizationId,
      namespaceId,
      namespaceHealth,
    });
  }

  private calculateStatus(
    podStatuses: PodStatus[],
    isTerminating: boolean,
  ): HealthStatus {
    if (!podStatuses.length) {
      return null;
    }

    if (isTerminating) {
      return 'loading';
    }

    return podStatuses.reduce<HealthStatus>((agg, { status }) => {
      switch (status) {
        case 'loading': {
          return agg === 'crashed' ? agg : status;
        }
        case 'crashed': {
          return 'crashed';
        }
        default: {
          return agg;
        }
      }
    }, 'running');
  }

  private calculateUsage(podStatuses: PodStatus[]): NumericUsage {
    return podStatuses.reduce<NumericUsage>(
      (agg, { cpu, memory }) => {
        agg.cpu = agg.cpu + (cpu ?? 0);
        agg.memory = agg.memory + (memory ?? 0);
        return agg;
      },
      {
        cpu: 0,
        memory: 0,
      },
    );
  }

  private isWithinNSeconds(ts: string, seconds: number): boolean {
    const differenceInSeconds = dayjs().diff(dayjs(ts), 'second');
    return differenceInSeconds >= 0 && differenceInSeconds <= seconds;
  }
}
