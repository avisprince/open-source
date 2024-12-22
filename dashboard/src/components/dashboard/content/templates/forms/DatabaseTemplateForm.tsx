import { Button, Divider, Input, Select } from '@fluentui/react-components';
import { Copy20Regular } from '@fluentui/react-icons';
import { ChevronDown20Filled, ChevronUp20Filled } from '@fluentui/react-icons';
import copy from 'copy-to-clipboard';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';
import { useRecoilValue } from 'recoil';

import Flexbox from 'src/components/custom/Flexbox';
import useForm from 'src/components/dashboard/content/templates/forms/useForm';
import useToggleState from 'src/hooks/useToggleState';
import { sessionAtom } from 'src/recoil/dashboard/dashboard.atoms';
import { Stylesheet } from 'src/types/Stylesheet';

import { useUpdateTemplate } from '../hooks/useUpdateTemplate';
import { DatabaseTemplateFormQuery } from './__generated__/DatabaseTemplateFormQuery.graphql';
import {
  DatabaseTemplateForm_databaseBase$data,
  DatabaseTemplateForm_databaseBase$key,
} from './__generated__/DatabaseTemplateForm_databaseBase.graphql';

type Props = {
  databaseRef: DatabaseTemplateForm_databaseBase$key;
  templateId: string;
  isDisabled: boolean;
  connectionString?: string;
  onSave: () => void;
};

export default function DatabaseTempateForm({
  databaseRef,
  templateId,
  isDisabled,
  connectionString,
  onSave,
}: Props) {
  const database = useFragment(
    graphql`
      fragment DatabaseTemplateForm_databaseBase on DatabaseBase {
        displayName
        database
        initFile {
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
    databaseRef,
  );

  const [usageCollapsed, setUsageCollapsed] = useToggleState(false);
  const { orgId } = useRecoilValue(sessionAtom);
  const { orgDbInitFiles: initFiles } =
    useLazyLoadQuery<DatabaseTemplateFormQuery>(
      graphql`
        query DatabaseTemplateFormQuery($organizationId: ID!) {
          orgDbInitFiles(organizationId: $organizationId) {
            id
            fileName
            metadata {
              database
            }
          }
        }
      `,
      {
        organizationId: orgId,
      },
    );

  const [fields, handleFieldChange] =
    useForm<DatabaseTemplateForm_databaseBase$data>(database);

  const [updateTemplate] = useUpdateTemplate(templateId);
  const onClickSave = async () => {
    if (fields.displayName) {
      await updateTemplate({
        itemType: 'Database',
        database: {
          displayName: fields.displayName,
          database: fields.database,
          initFile: fields.initFile?.id,
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
        <Flexbox
          direction="column"
          gap={16}
          style={styles.databaseInfoSection}
          fullWidth
        >
          <Input
            placeholder="Name"
            value={fields.displayName}
            style={styles.databaseInfoInput}
            onChange={e => handleFieldChange('displayName', e.target.value)}
          />
          <Select
            placeholder="Database"
            onChange={e => handleFieldChange('database', e.target.value)}
            value={fields.database ?? ''}
            disabled={isDisabled}
          >
            <option value="">Database type</option>
            <option value="mysql">MySQL</option>
            <option value="postgres">Postgres</option>
            {/* <option value="mongodb">Mongo DB</option> */}
          </Select>
          <Select
            placeholder="Init File"
            onChange={e =>
              handleFieldChange(
                'initFile',
                initFiles.find(file => file.id === e.target.value) ?? null,
              )
            }
            value={fields.initFile?.id}
            disabled={isDisabled}
          >
            <option value="">Select Init File</option>
            {initFiles
              .filter(file => file.metadata.database === fields.database)
              .map(file => (
                <option key={file.id} value={file.id}>
                  {file.fileName}
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
        {connectionString && (
          <>
            <Divider />
            <Flexbox direction="column" gap={4} style={{ padding: 16 }}>
              <div>Connection String</div>
              <Flexbox gap={8}>
                <Input
                  style={{ flexGrow: 1 }}
                  value={connectionString}
                  readOnly
                />
                <Button
                  appearance="subtle"
                  onClick={() => copy(connectionString)}
                  icon={<Copy20Regular />}
                />
              </Flexbox>
            </Flexbox>
          </>
        )}
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
  databaseInfoSection: {
    padding: 16,
  },
  databaseInfoInput: {
    width: '100%',
  },
  title: {
    marginBottom: 8,
  },
  uploadSection: {
    width: '50%',
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
