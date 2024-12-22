import { NamespaceBuilder } from '#src/kubernetes/builders/namespace.builder';
import { Test } from '@nestjs/testing';
import { KubeClientFactory } from '#src/kubernetes/kubeConfig/kubeClient.factory';
import { CoreV1Api } from '@kubernetes/client-node';

const getMockKubeClientFactory = () => {
  const kubeClientFactory = new KubeClientFactory();
  kubeClientFactory.getCoreV1ApiClient = jest.fn();

  return kubeClientFactory;
};

describe('NamespaceBuilder', () => {
  let namespaceBuilder: NamespaceBuilder;
  let coreV1Api: CoreV1Api;
  let kubeClientFactory: KubeClientFactory;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [NamespaceBuilder],
    }).compile();

    namespaceBuilder = module.get<NamespaceBuilder>(NamespaceBuilder);
  });

  beforeEach(() => {
    coreV1Api = new CoreV1Api();
    coreV1Api.createNamespace = jest.fn();
    coreV1Api.deleteNamespace = jest.fn();

    kubeClientFactory = getMockKubeClientFactory();
    kubeClientFactory.getCoreV1ApiClient = jest.fn().mockReturnValue(coreV1Api);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  describe('build', () => {
    it('should call createNamespace', async () => {
      await namespaceBuilder.build(kubeClientFactory, 'test-namespace');

      expect(coreV1Api.createNamespace).toBeCalledTimes(1);
      expect(coreV1Api.createNamespace).toBeCalledWith({
        metadata: {
          name: 'test-namespace',
        },
      });
    });

    it('should handle errors from createNamespace', async () => {
      jest.spyOn(console, 'log');
      jest.spyOn(coreV1Api, 'createNamespace').mockImplementation(() => {
        throw {
          response: {
            body: 'error',
          },
        };
      });

      try {
        await namespaceBuilder.build(kubeClientFactory, 'test-namespace');
        expect(true).toBeFalsy();
      } catch (err) {
        expect(console.log).toBeCalledTimes(1);
        expect(console.log).toBeCalledWith({ response: { body: 'error' } });
        expect(err.response.body).toEqual('error');
      }
    });
  });

  describe('destroy', () => {
    it('should call deleteNamespace', async () => {
      await namespaceBuilder.destroy(kubeClientFactory, 'test-namespace');

      expect(coreV1Api.deleteNamespace).toBeCalledTimes(1);
      expect(coreV1Api.deleteNamespace).toBeCalledWith('test-namespace');
    });

    it('should handle errors from deleteNamespace', async () => {
      jest.spyOn(console, 'log');
      jest.spyOn(coreV1Api, 'deleteNamespace').mockImplementation(() => {
        throw {
          response: {
            body: 'error',
          },
        };
      });

      try {
        await namespaceBuilder.destroy(kubeClientFactory, 'test-namespace');
        expect(true).toBeFalsy();
      } catch (err) {
        expect(console.log).toBeCalledTimes(1);
        expect(console.log).toBeCalledWith({ response: { body: 'error' } });
        expect(err.response.body).toEqual('error');
      }
    });
  });
});
