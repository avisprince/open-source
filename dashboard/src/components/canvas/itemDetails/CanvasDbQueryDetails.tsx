import { Spinner } from '@fluentui/react-components';
import { Send24Filled } from '@fluentui/react-icons';
import { faCode } from '@fortawesome/free-solid-svg-icons';
import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';

import CanvasArrow from 'src/components/canvas/CanvasArrow';
import CanvasItem from 'src/components/canvas/CanvasItem';
import { CanvasButton } from 'src/components/canvas/custom';
import usePointerEvents from 'src/components/canvas/custom/usePointerEvents';
import DbQueryForm from 'src/components/canvas/namespaceItemForms/DbQueryForm';
import { useSendDbQueryToNamespace } from 'src/components/canvas/relay/useSendDbQueryToNamespace';
import { useUpdateNamespaceItem } from 'src/components/canvas/relay/useUpdateNamespaceItem';
import useDebounce from 'src/hooks/useDebounce';

import { DbQueryInput } from '../relay/__generated__/useUpdateNamespaceItemMutation.graphql';
import { CanvasDbQueryDetails_dbQuery$key } from './__generated__/CanvasDbQueryDetails_dbQuery.graphql';
import { CanvasDbQueryDetails_namespace$key } from './__generated__/CanvasDbQueryDetails_namespace.graphql';

type Props = {
  dbQueryRef: CanvasDbQueryDetails_dbQuery$key;
  namespaceRef: CanvasDbQueryDetails_namespace$key;
};

export default function CanvasDbQueryDetails({
  dbQueryRef,
  namespaceRef,
}: Props) {
  const dbQuery = useFragment(
    graphql`
      fragment CanvasDbQueryDetails_dbQuery on DbQuery {
        itemId
        target
        ...CanvasArrow_namespaceItem
        ...CanvasItem_namespaceItem
        ...DbQueryForm_dbQueryBase
      }
    `,
    dbQueryRef,
  );

  const namespace = useFragment(
    graphql`
      fragment CanvasDbQueryDetails_namespace on Namespace {
        status
        databases {
          itemId
          namespaceStatus
          database
          ...CanvasArrow_namespaceItem
          ...DbQueryForm_databases
        }
      }
    `,
    namespaceRef,
  );

  const pointerEvents = usePointerEvents();
  const [updateItem] = useUpdateNamespaceItem();
  const debouncedUpdate = useDebounce(updateItem, 300);
  const [runDbQuery, loading, results] = useSendDbQueryToNamespace(
    dbQuery.itemId,
  );

  const onUpdate = (updatedDbQuery: DbQueryInput) => {
    debouncedUpdate({
      itemType: 'DbQuery',
      dbQuery: {
        itemId: dbQuery.itemId,
        ...updatedDbQuery,
      },
    });
  };

  const targetDatabase = useMemo(() => {
    return namespace.databases.find(db => db.itemId === dbQuery.target);
  }, [namespace.databases, dbQuery.target]);

  const arrow = useMemo(() => {
    if (!targetDatabase) {
      return null;
    }

    return <CanvasArrow node1Ref={dbQuery} node2Ref={targetDatabase} />;
  }, [targetDatabase, dbQuery]);

  const sendButton = useMemo(() => {
    if (namespace.status !== 'active') {
      return null;
    }

    if (loading) {
      return <Spinner size="tiny" />;
    }

    return (
      <CanvasButton
        pointerEvents={pointerEvents}
        appearance="primary"
        icon={<Send24Filled />}
        onClick={runDbQuery}
        disabled={targetDatabase?.namespaceStatus !== 'running'}
      />
    );
  }, [
    loading,
    namespace.status,
    pointerEvents,
    targetDatabase?.namespaceStatus,
    runDbQuery,
  ]);

  return (
    <>
      <CanvasItem
        namespaceItemRef={dbQuery}
        icon={faCode}
        showHealthIcon={false}
        headerAction={sendButton}
      >
        <DbQueryForm
          key={dbQuery.itemId}
          dbQueryRef={dbQuery}
          databasesRef={namespace.databases}
          pointerEvents={pointerEvents}
          results={results}
          onUpdate={onUpdate}
          editorLanguage={
            targetDatabase?.database === 'mongodb' ? 'json' : 'sql'
          }
        />
      </CanvasItem>
      {arrow}
    </>
  );
}
