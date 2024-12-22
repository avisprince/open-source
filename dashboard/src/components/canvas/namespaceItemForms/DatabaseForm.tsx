import { Divider } from '@fluentui/react-components';
import { Copy20Regular } from '@fluentui/react-icons';
import { ChevronDown20Filled, ChevronUp20Filled } from '@fluentui/react-icons';
import copy from 'copy-to-clipboard';
import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';

import {
  CanvasButton,
  CanvasInput,
  CanvasSelect,
} from 'src/components/canvas/custom';
import useAutoSaveForm from 'src/components/canvas/hooks/useAutoSaveForm';
import Flexbox from 'src/components/custom/Flexbox';
import Icon from 'src/components/custom/Icon';
import NewDatabaseFileModal from 'src/components/dashboard/content/databaseFiles/NewDatabaseFileModal';
import useToggleState from 'src/hooks/useToggleState';
import { Stylesheet } from 'src/types/Stylesheet';

import { DatabaseInput } from '../relay/__generated__/useUpdateNamespaceItemMutation.graphql';
import {
  DatabaseForm_databaseBase$data,
  DatabaseForm_databaseBase$key,
} from './__generated__/DatabaseForm_databaseBase.graphql';
import { DatabaseForm_initFiles$key } from './__generated__/DatabaseForm_initFiles.graphql';

type Props = {
  databaseRef: DatabaseForm_databaseBase$key;
  initFilesRef: DatabaseForm_initFiles$key;
  pointerEvents: 'auto' | 'none';
  isDisabled: boolean;
  connectionString?: string;
  onUpdate: (database: DatabaseInput) => void;
  orgId: string;
};

export default function DatabaseForm({
  databaseRef,
  initFilesRef,
  pointerEvents,
  isDisabled,
  connectionString,
  onUpdate,
  orgId,
}: Props) {
  const database = useFragment(
    graphql`
      fragment DatabaseForm_databaseBase on DatabaseBase {
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
        updatedAt
      }
    `,
    databaseRef,
  );

  const initFiles = useFragment(
    graphql`
      fragment DatabaseForm_initFiles on Upload @relay(plural: true) {
        id
        fileName
        metadata {
          database
        }
      }
    `,
    initFilesRef,
  );

  const [usageCollapsed, setUsageCollapsed] = useToggleState(false);
  const [showUploadModal, setShowUploadModal] = useToggleState(false);

  const update = useCallback(
    async (data: DatabaseForm_databaseBase$data) => {
      if (data.displayName) {
        await onUpdate({
          displayName: data.displayName,
          database: data.database,
          initFile: data.initFile?.id,
          updatedAt: data.updatedAt,
          minResources: data.minResources,
          maxResources: data.maxResources,
        });
      }
    },
    [onUpdate],
  );

  const [fields, handleFieldChange] =
    useAutoSaveForm<DatabaseForm_databaseBase$data>(database, update);

  return (
    <>
      <Flexbox direction="column" fullWidth>
        <Flexbox
          direction="column"
          gap={16}
          style={styles.databaseInfoSection}
          fullWidth
        >
          <CanvasInput
            pointerEvents={pointerEvents}
            placeholder="Name"
            value={fields.displayName}
            style={styles.databaseInfoInput}
            onChange={e => handleFieldChange('displayName', e.target.value)}
          />
          <CanvasSelect
            pointerEvents={pointerEvents}
            placeholder="Database"
            onChange={e => handleFieldChange('database', e.target.value)}
            value={fields.database ?? ''}
            disabled={isDisabled}
          >
            <option value="">Database type</option>
            <option value="mysql">MySQL</option>
            <option value="postgres">Postgres</option>
            {/* <option value="mongodb">Mongo DB</option> */}
          </CanvasSelect>
          <Flexbox alignItems="center" gap={8}>
            <CanvasSelect
              pointerEvents={pointerEvents}
              placeholder="Init File"
              onChange={e =>
                handleFieldChange(
                  'initFile',
                  initFiles.find(file => file.id === e.target.value),
                )
              }
              value={fields.initFile?.id}
              disabled={isDisabled}
              style={{ width: '100%' }}
            >
              <option value="">Select Init File</option>
              {initFiles
                .filter(file => file.metadata.database === fields.database)
                .map(file => (
                  <option key={file.id} value={file.id}>
                    {file.fileName}
                  </option>
                ))}
            </CanvasSelect>
            <CanvasButton
              pointerEvents={pointerEvents}
              appearance="subtle"
              icon={<Icon name="plus" />}
              onClick={setShowUploadModal}
            />
          </Flexbox>
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
                    handleFieldChange('maxResources', {
                      ...fields.maxResources,
                      cpu: parseInt(e.target.value.replace(/\D/g, ''), 10),
                    });
                  }}
                />
                <CanvasInput
                  value={fields.maxResources.memory.toString()}
                  disabled={isDisabled}
                  pointerEvents={pointerEvents}
                  placeholder="Max RAM"
                  onChange={e => {
                    handleFieldChange('maxResources', {
                      ...fields.maxResources,
                      memory: parseInt(e.target.value.replace(/\D/g, ''), 10),
                    });
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
                <CanvasInput
                  style={{ flexGrow: 1 }}
                  pointerEvents={pointerEvents}
                  value={connectionString}
                  readOnly
                />
                <CanvasButton
                  pointerEvents={pointerEvents}
                  appearance="subtle"
                  onClick={() => copy(connectionString)}
                  icon={<Copy20Regular />}
                />
              </Flexbox>
            </Flexbox>
          </>
        )}
      </Flexbox>
      <NewDatabaseFileModal
        isOpen={showUploadModal}
        onClose={setShowUploadModal}
        orgId={orgId}
      />
    </>
  );
}

const styles = {
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
