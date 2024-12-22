import { Divider } from '@fluentui/react-components';
import {
  Add20Filled,
  ChevronDown20Filled,
  ChevronUp20Filled,
  Delete24Regular,
} from '@fluentui/react-icons';
import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';

import {
  CanvasButton,
  CanvasInput,
  CanvasSelect,
} from 'src/components/canvas/custom';
import useAutoSaveForm from 'src/components/canvas/hooks/useAutoSaveForm';
import Flexbox from 'src/components/custom/Flexbox';
import { DokkimiColorsV2 } from 'src/components/styles/colors';
import stylist from 'src/components/styles/stylist';
import useToggleState from 'src/hooks/useToggleState';
import { Stylesheet } from 'src/types/Stylesheet';

import { ServiceInput } from '../relay/__generated__/useUpdateNamespaceItemMutation.graphql';
import { ServiceForm_dockerRegistrySecrets$key } from './__generated__/ServiceForm_dockerRegistrySecrets.graphql';
import {
  ServiceForm_serviceBase$data,
  ServiceForm_serviceBase$key,
} from './__generated__/ServiceForm_serviceBase.graphql';

type Props = {
  serviceRef: ServiceForm_serviceBase$key;
  secretsRef: ServiceForm_dockerRegistrySecrets$key;
  pointerEvents: 'auto' | 'none';
  isDisabled: boolean;
  onUpdate: (service: ServiceInput) => void;
  envInputWidth?: number;
};

export default function ServiceForm({
  serviceRef,
  secretsRef,
  pointerEvents,
  isDisabled,
  onUpdate,
  envInputWidth,
}: Props) {
  const service = useFragment(
    graphql`
      fragment ServiceForm_serviceBase on ServiceBase {
        displayName
        domain
        image
        port
        healthCheck
        env {
          name
          value
        }
        dockerRegistrySecret {
          id
        }
        minResources {
          cpu
          memory
        }
        maxResources {
          cpu
          memory
        }
        updatedAt
      }
    `,
    serviceRef,
  );

  const secrets = useFragment(
    graphql`
      fragment ServiceForm_dockerRegistrySecrets on DockerRegistrySecret
      @relay(plural: true) {
        id
        name
      }
    `,
    secretsRef,
  );

  const [envVarsCollapsed, setEnvVarsCollapsed] = useToggleState(true);
  const [usageCollapsed, setUsageCollapsed] = useToggleState(false);

  const update = useCallback(
    async (data: ServiceForm_serviceBase$data) => {
      if (data.displayName) {
        await onUpdate({
          displayName: data.displayName,
          image: data.image,
          domain: data.domain,
          port: data.port,
          healthCheck: data.healthCheck,
          dockerRegistrySecret: data.dockerRegistrySecret?.id ?? undefined,
          env: data.env,
          minResources: data.minResources,
          maxResources: data.maxResources,
          updatedAt: data.updatedAt,
        });
      }
    },
    [onUpdate],
  );

  const [fields, handleFieldChange] =
    useAutoSaveForm<ServiceForm_serviceBase$data>(service, update);

  return (
    <Flexbox direction="column" fullWidth>
      <Flexbox direction="column" gap={16} style={styles.serviceInfoSection}>
        <CanvasInput
          pointerEvents={pointerEvents}
          placeholder="Name"
          value={fields.displayName}
          style={styles.serviceInfoInput}
          onChange={e => handleFieldChange('displayName', e.target.value)}
        />
        <CanvasInput
          pointerEvents={pointerEvents}
          placeholder="Image"
          value={fields.image ?? ''}
          style={styles.serviceInfoInput}
          onChange={e => handleFieldChange('image', e.target.value)}
          disabled={isDisabled}
        />
        <Flexbox alignItems="center" gap={16}>
          <CanvasInput
            pointerEvents={pointerEvents}
            placeholder="Domain"
            value={fields.domain ?? ''}
            style={styles.serviceInfoInput}
            onChange={e => handleFieldChange('domain', e.target.value)}
            disabled={isDisabled}
          />
          <CanvasInput
            pointerEvents={pointerEvents}
            placeholder="Port"
            value={fields.port?.toString() ?? ''}
            style={styles.serviceInfoInput}
            onChange={e =>
              handleFieldChange(
                'port',
                e.target.value
                  ? parseInt(e.target.value.replace(/\D/g, ''), 10)
                  : null,
              )
            }
            disabled={isDisabled}
          />
        </Flexbox>
        <CanvasInput
          pointerEvents={pointerEvents}
          placeholder="Health Check"
          value={fields.healthCheck ?? ''}
          style={styles.serviceInfoInput}
          onChange={e => handleFieldChange('healthCheck', e.target.value)}
          disabled={isDisabled}
        />
        <CanvasSelect
          pointerEvents={pointerEvents}
          onChange={e =>
            handleFieldChange(
              'dockerRegistrySecret',
              secrets.find(s => s.id === e.target.value),
            )
          }
          value={fields.dockerRegistrySecret?.id ?? ''}
          disabled={isDisabled}
        >
          <option value="">Select Private Access Key</option>
          {secrets
            .filter(secret => secret.name)
            .map(secret => (
              <option key={secret.id} value={secret.id}>
                {secret.name}
              </option>
            ))}
        </CanvasSelect>
      </Flexbox>
      <Divider />
      <Flexbox
        direction="column"
        gap={16}
        style={styles.usageSection}
        fullWidth
      >
        <Flexbox alignItems="center" justifyContent="space-between">
          <div>Allocated Resources</div>
          <CanvasButton
            pointerEvents={pointerEvents}
            appearance="subtle"
            icon={
              usageCollapsed ? <ChevronUp20Filled /> : <ChevronDown20Filled />
            }
            onClick={setUsageCollapsed}
          />
        </Flexbox>
        {!usageCollapsed && (
          <Flexbox direction="column" gap={8}>
            <Flexbox alignItems="center" gap={8}>
              <div style={styles.usageLabel} />
              <div style={styles.usageCol}>CPU (millicores)</div>
              <div style={styles.usageCol}>RAM (Mibibytes)</div>
            </Flexbox>
            <Flexbox alignItems="center" gap={8}>
              <div style={styles.usageLabel}>Min</div>
              <CanvasInput
                value={fields.minResources.cpu.toString()}
                disabled={isDisabled}
                pointerEvents={pointerEvents}
                placeholder="Min CPU"
                onChange={e => {
                  handleFieldChange('minResources', {
                    ...fields.minResources,
                    cpu: parseInt(e.target.value.replace(/\D/g, ''), 10),
                  });
                }}
              />
              <CanvasInput
                value={fields.minResources.memory.toString()}
                disabled={isDisabled}
                pointerEvents={pointerEvents}
                placeholder="Min RAM"
                onChange={e => {
                  handleFieldChange('minResources', {
                    ...fields.minResources,
                    memory: parseInt(e.target.value.replace(/\D/g, ''), 10),
                  });
                }}
              />
            </Flexbox>
            <Flexbox alignItems="center" gap={8}>
              <div style={styles.usageLabel}>Max</div>
              <CanvasInput
                value={fields.maxResources.cpu.toString()}
                disabled={isDisabled}
                pointerEvents={pointerEvents}
                placeholder="Max CPU"
                onChange={e => {
                  const cpu = parseInt(e.target.value.replace(/\D/g, ''), 10);
                  if (cpu >= fields.maxResources.cpu) {
                    handleFieldChange('maxResources', {
                      ...fields.maxResources,
                      cpu,
                    });
                  }
                }}
              />
              <CanvasInput
                value={fields.maxResources.memory.toString()}
                disabled={isDisabled}
                pointerEvents={pointerEvents}
                placeholder="Max RAM"
                onChange={e => {
                  const memory = parseInt(
                    e.target.value.replace(/\D/g, ''),
                    10,
                  );
                  if (memory >= fields.maxResources.memory) {
                    handleFieldChange('maxResources', {
                      ...fields.maxResources,
                      memory: parseInt(e.target.value.replace(/\D/g, ''), 10),
                    });
                  }
                }}
              />
            </Flexbox>
          </Flexbox>
        )}
      </Flexbox>
      <Divider />
      <Flexbox
        direction="column"
        gap={Boolean(fields.env?.length) ? 16 : 0}
        style={styles.envVarSection}
        fullWidth
      >
        <Flexbox alignItems="center" justifyContent="space-between">
          <Flexbox alignItems="center" gap={8}>
            <div>Environment Variables</div>
            <div style={styles.envCount}>{fields.env?.length}</div>
          </Flexbox>
          <Flexbox alignItems="center" gap={4}>
            <CanvasButton
              pointerEvents={pointerEvents}
              appearance="subtle"
              icon={<Add20Filled />}
              onClick={() =>
                handleFieldChange('env', [
                  ...(fields.env ?? []),
                  { name: '', value: '' },
                ])
              }
              disabled={isDisabled}
            />
            <CanvasButton
              pointerEvents={pointerEvents}
              appearance="subtle"
              icon={
                envVarsCollapsed ? (
                  <ChevronUp20Filled />
                ) : (
                  <ChevronDown20Filled />
                )
              }
              onClick={setEnvVarsCollapsed}
            />
          </Flexbox>
        </Flexbox>
        {!envVarsCollapsed && (
          <Flexbox direction="column" gap={16} fullWidth>
            {fields.env?.map((envVar, index) => (
              <Flexbox alignItems="center" key={index} gap={12} fullWidth>
                <CanvasInput
                  pointerEvents={pointerEvents}
                  style={stylist([
                    styles.envInput,
                    { maxWidth: envInputWidth ?? 'auto' },
                  ])}
                  placeholder="Key"
                  value={envVar.name}
                  disabled={isDisabled}
                  onChange={e => {
                    const curr = fields.env ?? [];
                    const copy = curr.map(val => ({ ...val }));
                    copy[index].name = e.target.value;

                    handleFieldChange('env', copy);
                  }}
                />
                <CanvasInput
                  pointerEvents={pointerEvents}
                  style={stylist([
                    styles.envInput,
                    { maxWidth: envInputWidth ?? 'auto' },
                  ])}
                  placeholder="Value"
                  value={envVar.value}
                  disabled={isDisabled}
                  onChange={e => {
                    const curr = fields.env ?? [];
                    const copy = curr.map(val => ({ ...val }));
                    copy[index].value = e.target.value;

                    handleFieldChange('env', copy);
                  }}
                />
                <CanvasButton
                  pointerEvents={pointerEvents}
                  icon={<Delete24Regular />}
                  appearance="subtle"
                  disabled={isDisabled}
                  onClick={() => {
                    const curr = fields.env ?? [];

                    handleFieldChange('env', [
                      ...curr.slice(0, index),
                      ...curr.slice(index + 1),
                    ]);
                  }}
                />
              </Flexbox>
            ))}
          </Flexbox>
        )}
      </Flexbox>
    </Flexbox>
  );
}

const styles = {
  envCount: {
    padding: '2px 8px',
    backgroundColor: DokkimiColorsV2.blackQuaternary,
    borderRadius: 4,
  },
  envInput: {
    flexGrow: 1,
  },
  envVarSection: {
    padding: 16,
  },
  serviceInfoSection: {
    padding: 16,
  },
  serviceInfoInput: {
    width: '100%',
  },
  usageSection: {
    padding: 16,
  },
  usageLabel: {
    width: 40,
  },
  usageCol: {
    flexGrow: 1,
  },
} satisfies Stylesheet;
