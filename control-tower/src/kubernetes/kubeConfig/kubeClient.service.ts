import { Injectable } from '@nestjs/common';

import { KubeClientFactory } from '#src/kubernetes/kubeConfig/kubeClient.factory';

@Injectable()
export default class KubeClientService {
  public async getKubeClientFactory(): Promise<KubeClientFactory> {
    return new KubeClientFactory();
  }
}
