import { KubeClientFactory } from '#src/kubernetes/kubeConfig/kubeClient.factory';
import { AppsV1Api, CoreV1Api, NetworkingV1Api, RbacAuthorizationV1Api } from '@kubernetes/client-node';

const loadFromString = jest.fn();
const loadFromDefault = jest.fn();
const makeApiClient = jest.fn();

jest.mock('@kubernetes/client-node', () => ({
  KubeConfig: jest.fn().mockImplementation(() => ({
    loadFromString,
    loadFromDefault,
    makeApiClient,
  })),
}));

describe('KubeClientFactory', () => {
  afterEach(() => {
    loadFromString.mockReset();
    loadFromDefault.mockReset();
    makeApiClient.mockReset();
  });

  describe('constructor', () => {
    it('should take a null file in the constructor', () => {
      new KubeClientFactory();

      expect(loadFromDefault).toHaveBeenCalledTimes(1);
      expect(loadFromString).toHaveBeenCalledTimes(0);
    });

    it('should take a file in the constructor', () => {
      new KubeClientFactory('file');

      expect(loadFromDefault).toHaveBeenCalledTimes(0);
      expect(loadFromString).toHaveBeenCalledTimes(1);
      expect(loadFromString).toBeCalledWith('file');
    });
  });

  describe('getNetworkingV1ApiClient', () => {
    it('should call makeApiClient', () => {
      const config = new KubeClientFactory();
      config.getNetworkingV1ApiClient();

      expect(makeApiClient).toHaveBeenCalledTimes(1);
      expect(makeApiClient).toHaveBeenCalledWith(NetworkingV1Api);
    });
  });

  describe('getCoreV1ApiClient', () => {
    it('should call makeApiClient', () => {
      const config = new KubeClientFactory();
      config.getCoreV1ApiClient();

      expect(makeApiClient).toHaveBeenCalledTimes(1);
      expect(makeApiClient).toHaveBeenCalledWith(CoreV1Api);
    });
  });

  describe('getRbacAuthorizationV1Api', () => {
    it('should call makeApiClient', () => {
      const config = new KubeClientFactory();
      config.getRbacAuthorizationV1Api();

      expect(makeApiClient).toHaveBeenCalledTimes(1);
      expect(makeApiClient).toHaveBeenCalledWith(RbacAuthorizationV1Api);
    });
  });

  describe('getAppsV1ApiClient', () => {
    it('should call makeApiClient', () => {
      const config = new KubeClientFactory();
      config.getAppsV1ApiClient();

      expect(makeApiClient).toHaveBeenCalledTimes(1);
      expect(makeApiClient).toHaveBeenCalledWith(AppsV1Api);
    });
  });
});
