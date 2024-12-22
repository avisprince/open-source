import { CloudStatus } from '#src/constants/cloudStatus.constants';
import { HttpRequest, Namespace, Service } from '#src/mongo/models';
import { MongoID } from '#src/types/mongo.types';

const service1: Service = {
  canvasInfo: {
    posX: 1826.711808,
    posY: 412.375210666667,
  },
  displayName: 'Service 1',
  dockerRegistrySecret: null,
  domain: 'service1.com',
  env: [
    {
      name: 'SERVICE_2',
      value: 'http://service2.com',
    },
  ],
  healthCheck: '/',
  image: 'avisprince/service1:latest',
  itemId: 'df2d9b8f9',
  itemType: 'Service',
  namespaceStatus: null,
  port: 5001,
  updatedAt: new Date(),
  errors: [],
};

const service2: Service = {
  canvasInfo: {
    posX: 938.666666666667,
    posY: 414.666666666667,
  },
  displayName: 'Service 2',
  dockerRegistrySecret: null,
  domain: 'service2.com',
  env: [
    {
      name: 'SERVICE_1',
      value: 'http://service1.com',
    },
  ],
  healthCheck: '/',
  image: 'avisprince/service2:latest',
  itemId: 'db0de93b9',
  itemType: 'Service',
  namespaceStatus: null,
  port: 5002,
  updatedAt: null,
  errors: [],
};

const httpRequest: HttpRequest = {
  body: '',
  canvasInfo: {
    posX: 238.666666666667,
    posY: 333.333333333333,
  },
  displayName: 'Http Request',
  headers: '',
  itemId: 'db88c0408',
  itemType: 'HttpRequest',
  method: 'GET',
  path: '/service1',
  target: 'db0de93b9',
  updatedAt: null,
};

export const demoNamespace = (
  email: string,
  organizationId: MongoID,
): Partial<Namespace> => {
  return {
    name: 'Demo',
    type: 'sandbox',
    items: [service1, service2, httpRequest],
    actions: [],
    queries: [],
    activeUsers: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    status: CloudStatus.INACTIVE,
    permissions: {
      organizationId,
      author: email,
      owner: email,
      memberOverrides: [],
    },
  };
};
