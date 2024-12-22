import {
  AppsV1Api,
  CoreV1Api,
  KubeConfig,
  Metrics,
  NetworkingV1Api,
  RbacAuthorizationV1Api,
} from '@kubernetes/client-node';

export class KubeClientFactory {
  private readonly kubeConfig: KubeConfig;

  constructor(file?: string) {
    this.kubeConfig = new KubeConfig();

    if (!!file) {
      this.kubeConfig.loadFromString(file);
    } else {
      this.kubeConfig.loadFromDefault();
    }
  }

  public getCoreV1ApiClient(): CoreV1Api {
    return this.kubeConfig.makeApiClient(CoreV1Api);
  }

  public getNetworkingV1ApiClient(): NetworkingV1Api {
    return this.kubeConfig.makeApiClient(NetworkingV1Api);
  }

  public getRbacAuthorizationV1Api(): RbacAuthorizationV1Api {
    return this.kubeConfig.makeApiClient(RbacAuthorizationV1Api);
  }

  public getAppsV1ApiClient(): AppsV1Api {
    return this.kubeConfig.makeApiClient(AppsV1Api);
  }

  public getMetricsClient(): Metrics {
    return new Metrics(this.kubeConfig);
  }
}
