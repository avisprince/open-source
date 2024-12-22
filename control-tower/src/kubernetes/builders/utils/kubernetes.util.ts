import { CLUSTER_DOMAIN } from '#src/app.contants';
import { KubeClientFactory } from '#src/kubernetes/kubeConfig/kubeClient.factory';
import { UrlMap } from '#src/kubernetes/types/urlMap';
import { Namespace } from '#src/mongo/models';

export async function patchNamespacedReplicationController(
  kubeClientFactory: KubeClientFactory,
  name: string,
  namespaceId: string,
  body: object,
): Promise<void> {
  const k8sApi = kubeClientFactory.getCoreV1ApiClient();
  await k8sApi.patchNamespacedReplicationController(
    name,
    namespaceId,
    body,
    'true',
    undefined,
    undefined,
    undefined,
    undefined,
    {
      headers: {
        'Content-Type': 'application/strategic-merge-patch+json',
      },
    },
  );
}

export async function patchNamespacedService(
  kubeClientFactory: KubeClientFactory,
  name: string,
  namespaceId: string,
  body: object,
): Promise<void> {
  const k8sApi = kubeClientFactory.getCoreV1ApiClient();
  await k8sApi.patchNamespacedService(
    name,
    namespaceId,
    body,
    'true',
    undefined,
    undefined,
    undefined,
    undefined,
    {
      headers: {
        'Content-Type': 'application/strategic-merge-patch+json',
      },
    },
  );
}

export function calculateUrlMap(namespace: Namespace): UrlMap {
  return namespace.services
    .filter(service => service.errors.length === 0)
    .reduce((agg, service) => {
      agg[service.domain] = {
        scheme: 'http',
        url: `${service.itemId}-service-${namespace.id}:${service.port}`,
        name: service.itemId,
      };
      return agg;
    }, {});
}

export function getClusterBaseUrl(): string {
  return `http://${CLUSTER_DOMAIN}`;
}
