import { useCallback } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import {
  CanvasCodeEditor,
  CanvasInput,
  CanvasSelect,
} from 'src/components/canvas/custom';
import useAutoSaveForm from 'src/components/canvas/hooks/useAutoSaveForm';
import Flexbox from 'src/components/custom/Flexbox';
import { Stylesheet } from 'src/types/Stylesheet';

import { useSendDbQueryToNamespaceMutation$data } from '../relay/__generated__/useSendDbQueryToNamespaceMutation.graphql';
import { DbQueryInput } from '../relay/__generated__/useUpdateNamespaceItemMutation.graphql';
import { DbQueryForm_databases$key } from './__generated__/DbQueryForm_databases.graphql';
import {
  DbQueryForm_dbQueryBase$data,
  DbQueryForm_dbQueryBase$key,
} from './__generated__/DbQueryForm_dbQueryBase.graphql';

type Props = {
  dbQueryRef: DbQueryForm_dbQueryBase$key;
  databasesRef: DbQueryForm_databases$key;
  pointerEvents: 'none' | 'auto';
  results?:
    | useSendDbQueryToNamespaceMutation$data['sendDbQueryToNamespace']
    | null;
  onlyShowRequest?: boolean;
  editorLanguage?: 'json' | 'sql';
  onUpdate: (dbQuery: DbQueryInput) => void;
};

export default function DbQueryForm({
  dbQueryRef,
  databasesRef,
  pointerEvents,
  results,
  onlyShowRequest,
  editorLanguage,
  onUpdate,
}: Props) {
  const dbQuery = useFragment(
    graphql`
      fragment DbQueryForm_dbQueryBase on DbQueryBase {
        displayName
        target
        query
        useDatabase
        updatedAt
      }
    `,
    dbQueryRef,
  );

  const databases = useFragment(
    graphql`
      fragment DbQueryForm_databases on Database @relay(plural: true) {
        itemId
        displayName
      }
    `,
    databasesRef,
  );

  const update = useCallback(
    async (data: DbQueryForm_dbQueryBase$data) => {
      if (data.displayName) {
        await onUpdate({
          ...dbQuery,
          displayName: data.displayName,
          target: data.target,
          query: data.query,
          useDatabase: data.useDatabase,
          updatedAt: data.updatedAt,
        });
      }
    },
    [dbQuery, onUpdate],
  );

  const [fields, handleFieldChange] =
    useAutoSaveForm<DbQueryForm_dbQueryBase$data>(dbQuery, update);

  return (
    <Flexbox
      alignItems="start"
      direction="column"
      gap={16}
      style={styles.content}
    >
      <CanvasInput
        pointerEvents={pointerEvents}
        placeholder="Name"
        value={fields.displayName}
        onChange={e => handleFieldChange('displayName', e.target.value)}
        style={styles.fullWidthInput}
      />
      <CanvasSelect
        pointerEvents={pointerEvents}
        onChange={e => handleFieldChange('target', e.target.value)}
        value={fields.target ?? ''}
        style={styles.fullWidthInput}
      >
        <option value="">Select Target Database</option>
        {databases.map((database, index) => (
          <option key={index} value={database.itemId}>
            {database.displayName}
          </option>
        ))}
      </CanvasSelect>
      <CanvasInput
        pointerEvents={pointerEvents}
        placeholder="Use Database"
        value={fields.useDatabase ?? ''}
        onChange={e => handleFieldChange('useDatabase', e.target.value)}
        style={styles.fullWidthInput}
      />
      <CanvasCodeEditor
        key={editorLanguage ?? 'sql'}
        pointerEvents={pointerEvents}
        title="Query"
        height={200}
        language={editorLanguage ?? 'sql'}
        value={fields.query ?? ''}
        onChange={val => handleFieldChange('query', val)}
      />
      {!onlyShowRequest && (
        <CanvasCodeEditor
          pointerEvents={pointerEvents}
          title="Response"
          height={200}
          value={results ? JSON.stringify(results) : ''}
          readOnly
        />
      )}
    </Flexbox>
  );
}

const styles = {
  content: {
    padding: 16,
  },
  fullWidthInput: {
    width: '100%',
  },
} satisfies Stylesheet;
