import { NodeMetric, topNodes } from '@kubernetes/client-node';
import { Injectable } from '@nestjs/common';
import { Dictionary } from 'lodash';
import { sumBy } from 'lodash/fp';

import { CloudStatus } from '#src/constants/cloudStatus.constants';
import { KubeClientFactory } from '#src/kubernetes/kubeConfig/kubeClient.factory';
import KubeClientService from '#src/kubernetes/kubeConfig/kubeClient.service';
import { Namespace } from '#src/mongo/models';
import { Totals } from '#src/mongo/models/telemetry.model';
import {
  NamespacesRepository,
  TelemetryRepository,
} from '#src/mongo/repositories';

@Injectable()
export default class TelemetryService {
  /** https://github.com/kubeshop/monokle */
  private readonly memoryMultipliers: Dictionary<number> = {
    k: 1000,
    M: 1000 ** 2,
    G: 1000 ** 3,
    T: 1000 ** 4,
    P: 1000 ** 5,
    E: 1000 ** 6,
    Ki: 1024,
    Mi: 1024 ** 2,
    Gi: 1024 ** 3,
    Ti: 1024 ** 4,
    Pi: 1024 ** 5,
    Ei: 1024 ** 6,
  };

  constructor(
    private readonly namespacesRepository: NamespacesRepository,
    private readonly telemetryRepository: TelemetryRepository,
    private readonly kubeClientService: KubeClientService,
  ) {}

  public async isNamespaceTerminated(namespace: Namespace): Promise<boolean> {
    const namespaceId = namespace.id.toString();
    const kubeClientFactory =
      await this.kubeClientService.getKubeClientFactory();
    const k8sApi = kubeClientFactory.getCoreV1ApiClient();
    const { body: podList } = await k8sApi.listNamespacedPod(namespaceId);

    if (podList.items.length) {
      return false;
    }

    try {
      await k8sApi.readNamespaceStatus(namespaceId);
      return false;
    } catch (err) {
      return true;
    }
  }

  public async monitorUsage(): Promise<void> {
    const namespaces = await this.namespacesRepository.find({
      status: { $ne: CloudStatus.INACTIVE },
    });

    const namespaceIds = namespaces.map(n => n.id.toString());
    const config = await this.kubeClientService.getKubeClientFactory();
    const metrics = config.getMetricsClient();
    const totals = await this.getClusterUsage(config);
    const nodeMetricsList = await metrics.getNodeMetrics();

    const nodeMetrics = nodeMetricsList.items.map(metric => {
      return {
        name: metric.metadata.name,
        usage: metric.usage,
      };
    });

    for (const namespaceId of namespaceIds) {
      const podMetricsList = await metrics.getPodMetrics(namespaceId);
      const podMetrics = podMetricsList.items.map(metric => {
        return {
          name: metric.metadata.name,
          usage: metric.containers.map(c => c.usage),
        };
      });

      await this.telemetryRepository.create({
        namespaceId,
        totals,
        podMetrics,
        nodeMetrics,
      });
    }
  }

  public async getClusterUsage(
    kubeClientFactory: KubeClientFactory,
  ): Promise<Totals> {
    const nodes = await topNodes(kubeClientFactory.getCoreV1ApiClient());
    const nodeMetrics: NodeMetric[] = (
      await kubeClientFactory.getMetricsClient().getNodeMetrics()
    ).items;

    const formatted = nodeMetrics.reduce<
      Dictionary<{ cpu: number; memory: number }>
    >((acc, { metadata, usage: { cpu, memory } }) => {
      const name = metadata?.name;
      const { Node } = nodes.find(
        ({ Node }) => Node?.metadata?.name === metadata.name,
      );

      const capacity = Node.status?.capacity;

      return {
        ...acc,
        [name]: {
          cpu: this.cpuParser(cpu) / this.cpuParser(capacity?.cpu || '0'),
          memory:
            this.memoryParser(memory) /
            this.memoryParser(capacity?.memory || '0'),
        },
      };
    }, {});

    const fvals = Object.values(formatted);
    return {
      cpu: sumBy('cpu', fvals) / (fvals.length ?? 1),
      memory: sumBy('memory', fvals) / (fvals.length ?? 1),
      nodes: formatted,
    };
  }

  /** https://github.com/kubeshop/monokle */
  // Return all units as 'millicores' which equals 1vCPU/1000
  public cpuParser(input: string): number {
    const mMatch: RegExpMatchArray | null = input.match(/^([0-9]+)m$/);
    if (mMatch) {
      return Number(mMatch[1]);
    }

    const uMatch: RegExpMatchArray | null = input.match(/^([0-9]+)u$/);
    if (uMatch) {
      return Number(uMatch[1]) / 1000;
    }

    const nMatch: RegExpMatchArray | null = input.match(/^([0-9]+)n$/);
    if (nMatch) {
      return Number(nMatch[1]) / 1000000;
    }

    return Number(input) * 1000;
  }

  /** https://github.com/kubeshop/monokle */
  // returns all units as Mi
  public memoryParser(input: string): number {
    const unitMatch = input.match(/^([0-9]+)([A-Za-z]{1,2})$/);
    if (unitMatch) {
      return (
        (Number(unitMatch[1]) * this.memoryMultipliers[String(unitMatch[2])]) /
        this.memoryMultipliers['Mi']
      );
    }

    return Number(input) / this.memoryMultipliers['Mi'];
  }
}
