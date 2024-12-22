import { Button, Divider, Input, Select } from '@fluentui/react-components';
import {
  Add20Filled,
  ChevronDown20Filled,
  ChevronUp20Filled,
  Delete24Regular,
} from '@fluentui/react-icons';
import { useState } from 'react';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';
import { useRecoilValue } from 'recoil';

import Flexbox from 'src/components/custom/Flexbox';
import useForm from 'src/components/dashboard/content/templates/forms/useForm';
import stylist from 'src/components/styles/stylist';
import useToggleState from 'src/hooks/useToggleState';
import { sessionAtom } from 'src/recoil/dashboard/dashboard.atoms';
import { Stylesheet } from 'src/types/Stylesheet';

import { useUpdateTemplate } from '../hooks/useUpdateTemplate';
import { ServiceTemplateFormQuery } from './__generated__/ServiceTemplateFormQuery.graphql';
import {
  ServiceTemplateForm_serviceBase$data,
  ServiceTemplateForm_serviceBase$key,
} from './__generated__/ServiceTemplateForm_serviceBase.graphql';

type Props = {
  serviceRef: ServiceTemplateForm_serviceBase$key;
  templateId: string;
  isDisabled: boolean;
  onSave: () => void;
};

export default function ServiceTemplateForm({
  serviceRef,
  templateId,
  isDisabled,
  onSave,
}: Props) {
  const [envVarsCollapsed, setEnvVarsCollapsed] = useState<boolean>(false);
  const service = useFragment(
    graphql`
      fragment ServiceTemplateForm_serviceBase on ServiceBase {
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
      }
    `,
    serviceRef,
  );

  const [usageCollapsed, setUsageCollapsed] = useToggleState(false);
  const { orgId } = useRecoilValue(sessionAtom);
  const { orgSecrets } = useLazyLoadQuery<ServiceTemplateFormQuery>(
    graphql`
      query ServiceTemplateFormQuery($organizationId: ID!) {
        orgSecrets(organizationId: $organizationId) {
          id
          name
        }
      }
    `,
    {
      organizationId: orgId,
    },
  );

  const [fields, handleFieldChange] =
    useForm<ServiceTemplateForm_serviceBase$data>(service);

  const [updateTemplate] = useUpdateTemplate(templateId);
  const onClickSave = async () => {
    if (fields.displayName) {
      await updateTemplate({
        itemType: 'Service',
        service: {
          displayName: fields.displayName,
          image: fields.image,
          domain: fields.domain,
          port: fields.port,
          healthCheck: fields.healthCheck,
          dockerRegistrySecret: fields.dockerRegistrySecret?.id ?? undefined,
          env: fields.env,
        },
      });
      onSave();
    }
  };

  return (
    <Flexbox
      alignItems="center"
      justifyContent="center"
      direction="column"
      gap={16}
    >
      <Flexbox direction="column" fullWidth style={styles.container}>
        <Flexbox direction="column" gap={16} style={styles.serviceInfoSection}>
          <Input
            placeholder="Name"
            value={fields.displayName}
            style={styles.serviceInfoInput}
            onChange={e => handleFieldChange('displayName', e.target.value)}
          />
          <Input
            placeholder="Image"
            value={fields.image ?? ''}
            style={styles.serviceInfoInput}
            onChange={e => handleFieldChange('image', e.target.value)}
            disabled={isDisabled}
          />
          <Flexbox alignItems="center" gap={16}>
            <Input
              placeholder="Domain"
              value={fields.domain ?? ''}
              style={styles.serviceInfoInput}
              onChange={e => handleFieldChange('domain', e.target.value)}
              disabled={isDisabled}
            />
            <Input
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
          <Input
            placeholder="Health Check"
            value={fields.healthCheck ?? ''}
            style={styles.serviceInfoInput}
            onChange={e => handleFieldChange('healthCheck', e.target.value)}
            disabled={isDisabled}
          />
          <Select
            onChange={e =>
              handleFieldChange(
                'dockerRegistrySecret',
                orgSecrets.find(s => s.id === e.target.value) ?? '',
              )
            }
            value={fields.dockerRegistrySecret?.id ?? ''}
            disabled={isDisabled}
          >
            <option value="">Select Private Access Key</option>
            {orgSecrets
              .filter(secret => secret.name)
              .map(secret => (
                <option key={secret.id} value={secret.id}>
                  {secret.name}
                </option>
              ))}
          </Select>
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
            <Button
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
                <Input
                  value={fields.minResources.cpu.toString()}
                  disabled={isDisabled}
                  placeholder="Min CPU"
                  onChange={e => {
                    handleFieldChange('minResources', {
                      ...fields.minResources,
                      cpu: parseInt(e.target.value.replace(/\D/g, ''), 10),
                    });
                  }}
                />
                <Input
                  value={fields.minResources.memory.toString()}
                  disabled={isDisabled}
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
                <Input
                  value={fields.maxResources.cpu.toString()}
                  disabled={isDisabled}
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
                <Input
                  value={fields.maxResources.memory.toString()}
                  disabled={isDisabled}
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
            <div style={{ flexGrow: 1 }}>Environment Variables</div>
            <Button
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
            <Button
              appearance="subtle"
              icon={
                envVarsCollapsed ? (
                  <ChevronUp20Filled />
                ) : (
                  <ChevronDown20Filled />
                )
              }
              onClick={() => setEnvVarsCollapsed(!envVarsCollapsed)}
            />
          </Flexbox>
          {!envVarsCollapsed && (
            <Flexbox
              direction="column"
              gap={16}
              fullWidth
              style={styles.envVarsContainer}
            >
              {fields.env?.map((envVar, index) => (
                <Flexbox alignItems="center" key={index} gap={12} fullWidth>
                  <Input
                    style={stylist([styles.envInput, { maxWidth: 'auto' }])}
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
                  <Input
                    style={stylist([styles.envInput, { maxWidth: 'auto' }])}
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
                  <Button
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
      <Button
        appearance="primary"
        onClick={onClickSave}
        disabled={isDisabled || !fields.displayName}
      >
        Save
      </Button>
    </Flexbox>
  );
}

const styles = {
  container: {
    border: '1px solid #494949',
    borderRadius: 4,
  },
  envInput: {
    flexGrow: 1,
  },
  envVarsContainer: {
    overflowY: 'auto',
  },
  envVarSection: {
    padding: 16,
    maxHeight: 220,
    overflow: 'hidden',
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
