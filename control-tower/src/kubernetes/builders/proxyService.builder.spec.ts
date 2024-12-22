import { CoreV1Api } from '@kubernetes/client-node';
import { Test } from '@nestjs/testing';
import { KubeClientFactory } from '#src/kubernetes/kubeConfig/kubeClient.factory';
import { ProxyServiceBuilder } from '#src/kubernetes/builders/proxyService.builder';
import { PROXY_SERVICE_NAME } from '#models/src/constants/route.constants';
import { PodSpecUtil } from '#src/kubernetes/builders/utils/podSpec.util';

const getMockKubeClientFactory = () => {
  const kubeClientFactory = new KubeClientFactory();
  kubeClientFactory.getCoreV1ApiClient = jest.fn();

  return kubeClientFactory;
};

describe('ProxyServiceBuilder', () => {
  const namespace = 'testNamespace';

  let proxyServiceBuilder: ProxyServiceBuilder;
  let coreV1Api: CoreV1Api;
  let kubeClientFactory: KubeClientFactory;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [ProxyServiceBuilder, PodSpecUtil],
    }).compile();

    proxyServiceBuilder = module.get<ProxyServiceBuilder>(ProxyServiceBuilder);
  });

  beforeEach(() => {
    coreV1Api = new CoreV1Api();
    coreV1Api.createNamespacedReplicationController = jest.fn();
    coreV1Api.createNamespacedService = jest.fn();
    coreV1Api.deleteNamespacedService = jest.fn();
    coreV1Api.deleteNamespacedReplicationController = jest.fn();

    kubeClientFactory = getMockKubeClientFactory();
    kubeClientFactory.getCoreV1ApiClient = jest.fn().mockReturnValue(coreV1Api);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  describe('build', () => {
    it('should call createNamespacedReplicationController', async () => {
      await proxyServiceBuilder.build(kubeClientFactory, namespace);

      expect(coreV1Api.createNamespacedReplicationController).toBeCalledTimes(1);
      expect(coreV1Api.createNamespacedReplicationController).toBeCalledWith(namespace, {
        metadata: {
          name: PROXY_SERVICE_NAME,
          namespace,
        },
        spec: {
          replicas: 1,
          selector: {
            app: PROXY_SERVICE_NAME,
          },
          template: {
            metadata: {
              labels: {
                app: PROXY_SERVICE_NAME,
              },
            },
            spec: {
              containers: [
                {
                  name: PROXY_SERVICE_NAME,
                  image: `avisprince/${PROXY_SERVICE_NAME}:latest`,
                  imagePullPolicy: 'IfNotPresent',
                },
              ],
            },
          },
        },
      });
    });

    it('should use the dev container and volume mounts if env var is set', async () => {
      process.env.DEV_MODE_APP_DIR = 'path to local app dir';
      await proxyServiceBuilder.build(kubeClientFactory, namespace);

      expect(coreV1Api.createNamespacedReplicationController).toBeCalledTimes(1);
      expect(coreV1Api.createNamespacedReplicationController).toBeCalledWith(namespace, {
        metadata: {
          name: PROXY_SERVICE_NAME,
          namespace,
        },
        spec: {
          replicas: 1,
          selector: {
            app: PROXY_SERVICE_NAME,
          },
          template: {
            metadata: {
              labels: {
                app: PROXY_SERVICE_NAME,
              },
            },
            spec: {
              containers: [
                {
                  name: PROXY_SERVICE_NAME,
                  image: `${PROXY_SERVICE_NAME}:dev`,
                  imagePullPolicy: 'IfNotPresent',
                  volumeMounts: [
                    {
                      "mountPath": "/app",
                      "name": "appdir",
                    },
                  ],
                },
              ],
              volumes: [
                {
                  hostPath: {
                    path: "path to local app dir",
                    type: "Directory",
                  },
                  name: "appdir",
                },
              ],
            },
          },
        },
      });
    });

    it('should call createNamespacedService', async () => {
      await proxyServiceBuilder.build(kubeClientFactory, namespace);

      expect(coreV1Api.createNamespacedService).toBeCalledTimes(1);
      expect(coreV1Api.createNamespacedService).toBeCalledWith(namespace, {
        metadata: {
          name: `${PROXY_SERVICE_NAME}-service-${namespace}`,
          namespace,
        },
        spec: {
          selector: {
            app: PROXY_SERVICE_NAME,
          },
          ports: [
            {
              name: PROXY_SERVICE_NAME,
              protocol: 'TCP',
              port: 5001,
            },
          ],
        },
      });
    });

    it('should handle errors from createNamespacedReplicationController', async () => {
      jest.spyOn(console, 'log');
      jest.spyOn(coreV1Api, 'createNamespacedReplicationController').mockImplementation(() => {
        throw {
          response: {
            body: 'error',
          },
        };
      });

      await proxyServiceBuilder.build(kubeClientFactory, namespace);

      expect(console.log).toBeCalledTimes(1);
      expect(console.log).toBeCalledWith('error');
    });

    it('should handle errors from createNamespacedService', async () => {
      jest.spyOn(console, 'log');
      jest.spyOn(coreV1Api, 'createNamespacedService').mockImplementation(() => {
        throw {
          response: {
            body: 'error',
          },
        };
      });

      await proxyServiceBuilder.build(kubeClientFactory, namespace);

      expect(console.log).toBeCalledTimes(1);
      expect(console.log).toBeCalledWith('error');
    });
  });

  describe('destroy', () => {
    it('should call deleteNamespacedService', async () => {
      await proxyServiceBuilder.destroy(kubeClientFactory, namespace);

      expect(coreV1Api.deleteNamespacedService).toBeCalledTimes(1);
      expect(coreV1Api.deleteNamespacedService).toBeCalledWith(`${PROXY_SERVICE_NAME}-service-${namespace}`, namespace);
    });

    it('should call deleteNamespacedReplicationController', async () => {
      await proxyServiceBuilder.destroy(kubeClientFactory, namespace);

      expect(coreV1Api.deleteNamespacedReplicationController).toBeCalledTimes(1);
      expect(coreV1Api.deleteNamespacedReplicationController).toBeCalledWith(PROXY_SERVICE_NAME, namespace, null, null, null, null, null, {
        propagationPolicy: 'Foreground',
      });
    });

    it('should handle errors from deleteNamespacedService', async () => {
      jest.spyOn(console, 'log');
      jest.spyOn(coreV1Api, 'deleteNamespacedService').mockImplementation(() => {
        throw {
          response: {
            body: 'error',
          },
        };
      });

      try {
        await proxyServiceBuilder.destroy(kubeClientFactory, namespace);
        expect(true).toBeFalsy();
      } catch (err) {
        expect(console.log).toBeCalledTimes(1);
        expect(console.log).toBeCalledWith('error');
        expect(err.response.body).toEqual('error');
      }
    });

    it('should handle errors from deleteNamespacedReplicationController', async () => {
      jest.spyOn(console, 'log');
      jest.spyOn(coreV1Api, 'deleteNamespacedReplicationController').mockImplementation(() => {
        throw {
          response: {
            body: 'error',
          },
        };
      });

      try {
        await proxyServiceBuilder.destroy(kubeClientFactory, namespace);
        expect(true).toBeFalsy();
      } catch (err) {
        expect(console.log).toBeCalledTimes(1);
        expect(console.log).toBeCalledWith('error');
        expect(err.response.body).toEqual('error');
      }
    });
  });
});
