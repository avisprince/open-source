import { Test } from '@nestjs/testing';
import { FluentdBuilder } from '#src/kubernetes/builders/fluentd.builder';
import { AppsV1Api, CoreV1Api, RbacAuthorizationV1Api } from '@kubernetes/client-node';
import { KubeClientFactory } from '#src/kubernetes/kubeConfig/kubeClient.factory';

const FLUENTD = 'fluentd';
const FLUENT_CONF = 'fluent-conf';

jest.mock('@kubernetes/client-node', () => ({
  KubeConfig: jest.fn().mockImplementation(() => ({
    loadFromDefault: jest.fn(),
  })),
  CoreV1Api: jest.fn(),
  AppsV1Api: jest.fn(),
  RbacAuthorizationV1Api: jest.fn(),
}));

const getMockKubeClientFactory = () => {
  const kubeClientFactory = new KubeClientFactory();
  kubeClientFactory.getCoreV1ApiClient = jest.fn();
  kubeClientFactory.getRbacAuthorizationV1Api = jest.fn();
  kubeClientFactory.getAppsV1ApiClient = jest.fn();

  return kubeClientFactory;
};

describe('FluentdBuilder', () => {
  let fluentdBuilder: FluentdBuilder;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [FluentdBuilder],
    }).compile();

    fluentdBuilder = module.get<FluentdBuilder>(FluentdBuilder);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  describe('build', () => {
    let appsV1Api: AppsV1Api;
    let coreV1Api: CoreV1Api;
    let rbacV1Api: RbacAuthorizationV1Api;
    let kubeClientFactory: KubeClientFactory;

    beforeEach(() => {
      appsV1Api = new AppsV1Api();
      appsV1Api.createNamespacedDaemonSet = jest.fn();

      coreV1Api = new CoreV1Api();
      coreV1Api.createNamespacedConfigMap = jest.fn();
      coreV1Api.createNamespacedServiceAccount = jest.fn();

      rbacV1Api = new RbacAuthorizationV1Api();
      rbacV1Api.createClusterRole = jest.fn();
      rbacV1Api.createClusterRoleBinding = jest.fn();

      kubeClientFactory = getMockKubeClientFactory();
      kubeClientFactory.getCoreV1ApiClient = jest.fn().mockReturnValue(coreV1Api);
      kubeClientFactory.getAppsV1ApiClient = jest.fn().mockReturnValue(appsV1Api);
      kubeClientFactory.getRbacAuthorizationV1Api = jest.fn().mockReturnValue(rbacV1Api);
    });

    describe('createServiceAccount', () => {
      it('should call createNamespacedServiceAccount', async () => {
        const namespace = 'namespace';

        await fluentdBuilder.build(kubeClientFactory, 'namespace');

        expect(coreV1Api.createNamespacedServiceAccount).toBeCalledTimes(1);
        expect(coreV1Api.createNamespacedServiceAccount).toBeCalledWith('namespace', {
          metadata: {
            name: `${FLUENTD}-${namespace}`,
            namespace,
          },
        });
      });

      it('should catch errors', async () => {
        jest.spyOn(console, 'log');
        jest.spyOn(coreV1Api, 'createNamespacedServiceAccount').mockImplementation(() => {
          throw {
            body: 'error',
          };
        });

        await fluentdBuilder.build(kubeClientFactory, 'namespace');

        expect(console.log).toBeCalledTimes(1);
        expect(console.log).toBeCalledWith('error');
      });
    });

    describe('createClusterRole', () => {
      it('should call createClusterRole', async () => {
        const namespace = 'namespace';
        await fluentdBuilder.build(kubeClientFactory, namespace);

        expect(rbacV1Api.createClusterRole).toBeCalledTimes(1);
        expect(rbacV1Api.createClusterRole).toBeCalledWith({
          metadata: {
            name: `${FLUENTD}-${namespace}`,
            namespace,
          },
          rules: [
            {
              apiGroups: [''],
              resources: ['pods', 'namespaces'],
              verbs: ['get', 'list', 'watch'],
            },
          ],
        });
      });

      it('should handle errors', async () => {
        jest.spyOn(console, 'log');
        jest.spyOn(rbacV1Api, 'createClusterRole').mockImplementation(() => {
          throw {
            response: {
              body: 'error',
            },
          };
        });

        await fluentdBuilder.build(kubeClientFactory, 'namespace');

        expect(console.log).toBeCalledTimes(1);
        expect(console.log).toBeCalledWith('error');
      });
    });

    describe('createClusterRoleBinding', () => {
      it('should call createClusterRoleBinding', async () => {
        const namespace = 'namespace';
        const name = `${FLUENTD}-${namespace}`;

        await fluentdBuilder.build(kubeClientFactory, namespace);

        expect(rbacV1Api.createClusterRoleBinding).toBeCalledTimes(1);
        expect(rbacV1Api.createClusterRoleBinding).toBeCalledWith({
          metadata: {
            name,
          },
          roleRef: {
            kind: 'ClusterRole',
            name,
            apiGroup: 'rbac.authorization.k8s.io',
          },
          subjects: [
            {
              kind: 'ServiceAccount',
              name,
              namespace,
            },
          ],
        });
      });

      it('should handle errors', async () => {
        jest.spyOn(console, 'log');
        jest.spyOn(rbacV1Api, 'createClusterRoleBinding').mockImplementation(() => {
          throw {
            response: {
              body: 'error',
            },
          };
        });

        await fluentdBuilder.build(kubeClientFactory, 'namespace');

        expect(console.log).toBeCalledTimes(1);
        expect(console.log).toBeCalledWith('error');
      });
    });

    describe('createFluentdConf', () => {
      it('should call createNamespacedConfigMap', async () => {
        const namespace = 'namespace';
        process.env.CONTROL_TOWER_URI = 'CONTROL_TOWER_URI';
        process.env.API_KEY = 'API_KEY';

        await fluentdBuilder.build(kubeClientFactory, namespace);

        expect(coreV1Api.createNamespacedConfigMap).toBeCalledTimes(1);
        expect(coreV1Api.createNamespacedConfigMap).toBeCalledWith(namespace, {
          metadata: {
            name: FLUENT_CONF,
          },
          data: {
            'fluent.conf': `
            <source>
              @type tail
              read_from_head true
              tag dokkimi.*
              path /var/log/containers/*-pod-${namespace}*.log
              pos_file /var/log/fluentd-containers.log.pos
              exclude_path ["/var/log/containers/fluent*"]
              <parse>
                @type json
              </parse>
            </source>

            <filter dokkimi.**>
              @type record_transformer

              <record>
                namespaceId ${namespace}
                logFile \${tag}
              </record>
            </filter>

            <match dokkimi.**>
              @type copy

              <store>
                @type http
                endpoint ${process.env.CONTROL_TOWER_URI}/actions/logConsole
                headers {"ApiKey": "${process.env.API_KEY}"}
                json_array true

                <format>
                  @type json
                </format>
                <buffer>
                  flush_interval 0s
                </buffer>
              </store>

              <store>
                @type stdout
              </store>
            </match>
          `,
          },
        });
      });

      it('should handle errors', async () => {
        jest.spyOn(console, 'log');
        jest.spyOn(coreV1Api, 'createNamespacedConfigMap').mockImplementation(() => {
          throw {
            response: {
              body: 'error',
            },
          };
        });

        await fluentdBuilder.build(kubeClientFactory, 'namespace');

        expect(console.log).toBeCalledTimes(1);
        expect(console.log).toBeCalledWith('error');
      });
    });

    describe('createDaemonSet', () => {
      it('should call createNamespacedDaemonSet', async () => {
        const namespace = 'namespace';
        const name = `${FLUENTD}-${namespace}`;

        await fluentdBuilder.build(kubeClientFactory, namespace);

        expect(appsV1Api.createNamespacedDaemonSet).toBeCalledTimes(1);
        expect(appsV1Api.createNamespacedDaemonSet).toBeCalledWith(namespace, {
          metadata: {
            name,
            namespace,
            labels: {
              app: name,
            },
          },
          spec: {
            selector: {
              matchLabels: {
                app: name,
              },
            },
            template: {
              metadata: {
                labels: {
                  app: name,
                },
              },
              spec: {
                serviceAccount: name,
                serviceAccountName: name,
                tolerations: [
                  {
                    key: 'node-role.kubernetes.io/master',
                    effect: 'NoSchedule',
                  },
                ],
                containers: [
                  {
                    name: name,
                    image: 'fluent/fluentd-kubernetes-daemonset:v1-debian-forward',
                    env: [
                      {
                        name: 'FLUENT_UID',
                        value: '0',
                      },
                      {
                        name: 'FLUENTD_SYSTEMD_CONF',
                        value: 'disable',
                      },
                    ],
                    resources: {
                      limits: {
                        memory: '1000Mi',
                      },
                      requests: {
                        cpu: '500m',
                        memory: '500Mi',
                      },
                    },
                    volumeMounts: [
                      {
                        name: FLUENT_CONF,
                        mountPath: '/fluentd/etc/fluent.conf',
                        subPath: 'fluent.conf',
                      },
                      {
                        name: 'varlog',
                        mountPath: '/var/log',
                      },
                      {
                        name: 'varlibdockercontainers',
                        mountPath: '/var/lib/docker/containers',
                        readOnly: true,
                      },
                    ],
                  },
                ],
                volumes: [
                  {
                    name: FLUENT_CONF,
                    configMap: {
                      name: FLUENT_CONF,
                    },
                  },
                  {
                    name: 'varlog',
                    hostPath: {
                      path: '/var/log',
                    },
                  },
                  {
                    name: 'varlibdockercontainers',
                    hostPath: {
                      path: '/var/lib/docker/containers',
                    },
                  },
                ],
              },
            },
          },
        });
      });

      it('should handle errors', async () => {
        jest.spyOn(console, 'log');
        jest.spyOn(appsV1Api, 'createNamespacedDaemonSet').mockImplementation(() => {
          throw {
            response: {
              body: 'error',
            },
          };
        });

        await fluentdBuilder.build(kubeClientFactory, 'namespace');

        expect(console.log).toBeCalledTimes(1);
        expect(console.log).toBeCalledWith('error');
      });
    });
  });

  describe('destroy', () => {
    it('should call delete on all clients', async () => {
      const namespacedFluentd = `fluentd-namespace`;
      const appsV1Api = new AppsV1Api();
      appsV1Api.deleteNamespacedDaemonSet = jest.fn();

      const coreV1Api = new CoreV1Api();
      coreV1Api.deleteNamespacedConfigMap = jest.fn();
      coreV1Api.deleteNamespacedServiceAccount = jest.fn();

      const rbacV1Api = new RbacAuthorizationV1Api();
      rbacV1Api.deleteClusterRole = jest.fn();
      rbacV1Api.deleteClusterRoleBinding = jest.fn();

      const kubeClientFactory = getMockKubeClientFactory();
      kubeClientFactory.getCoreV1ApiClient = jest.fn().mockReturnValue(coreV1Api);
      kubeClientFactory.getAppsV1ApiClient = jest.fn().mockReturnValue(appsV1Api);
      kubeClientFactory.getRbacAuthorizationV1Api = jest.fn().mockReturnValue(rbacV1Api);

      await fluentdBuilder.destroy(kubeClientFactory, 'namespace');

      expect(appsV1Api.deleteNamespacedDaemonSet).toHaveBeenCalledTimes(1);
      expect(appsV1Api.deleteNamespacedDaemonSet).toHaveBeenCalledWith(namespacedFluentd, 'namespace');

      expect(coreV1Api.deleteNamespacedConfigMap).toHaveBeenCalledTimes(1);
      expect(coreV1Api.deleteNamespacedConfigMap).toHaveBeenCalledWith('fluent-conf', 'namespace');
      expect(coreV1Api.deleteNamespacedServiceAccount).toHaveBeenCalledTimes(1);
      expect(coreV1Api.deleteNamespacedServiceAccount).toHaveBeenCalledWith(namespacedFluentd, 'namespace');

      expect(rbacV1Api.deleteClusterRole).toHaveBeenCalledTimes(1);
      expect(rbacV1Api.deleteClusterRole).toHaveBeenCalledWith(namespacedFluentd);
      expect(rbacV1Api.deleteClusterRoleBinding).toHaveBeenCalledTimes(1);
      expect(rbacV1Api.deleteClusterRoleBinding).toHaveBeenCalledWith(namespacedFluentd);
    });

    it('should handle errors', async () => {
      jest.spyOn(console, 'log');

      const appsV1Api = new AppsV1Api();
      appsV1Api.deleteNamespacedDaemonSet = jest.fn().mockImplementation(() => {
        throw {
          response: {
            body: 'error',
          },
        };
      });

      const kubeClientFactory = getMockKubeClientFactory();
      kubeClientFactory.getAppsV1ApiClient = jest.fn().mockReturnValue(appsV1Api);

      await fluentdBuilder.destroy(kubeClientFactory, 'namespace');

      expect(console.log).toHaveBeenCalledTimes(1);
      expect(console.log).toHaveBeenCalledWith('error');
    });
  });
});
