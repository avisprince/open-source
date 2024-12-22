import { faDatabase } from '@fortawesome/free-solid-svg-icons';
import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import { useRecoilValue } from 'recoil';

import CanvasItem from 'src/components/canvas/CanvasItem';
import usePointerEvents from 'src/components/canvas/custom/usePointerEvents';
import DatabaseForm from 'src/components/canvas/namespaceItemForms/DatabaseForm';
import { useUpdateNamespaceItem } from 'src/components/canvas/relay/useUpdateNamespaceItem';
import useDebounce from 'src/hooks/useDebounce';
import { sessionAtom } from 'src/recoil/dashboard/dashboard.atoms';

import { DatabaseInput } from '../relay/__generated__/useUpdateNamespaceItemMutation.graphql';
import { CanvasDatabaseDetails_database$key } from './__generated__/CanvasDatabaseDetails_database.graphql';
import { CanvasDatabaseDetails_initFiles$key } from './__generated__/CanvasDatabaseDetails_initFiles.graphql';

type Props = {
  databaseRef: CanvasDatabaseDetails_database$key;
  initFilesRef: CanvasDatabaseDetails_initFiles$key;
  isDisabled?: boolean;
};

export default function CanvasDatabaseDetails({
  databaseRef,
  initFilesRef,
  isDisabled,
}: Props) {
  const database = useFragment(
    graphql`
      fragment CanvasDatabaseDetails_database on Database {
        itemId
        namespaceStatus
        database
        ...CanvasItem_namespaceItem
        ...DatabaseForm_databaseBase
      }
    `,
    databaseRef,
  );

  const initFiles = useFragment(
    graphql`
      fragment CanvasDatabaseDetails_initFiles on Upload @relay(plural: true) {
        ...DatabaseForm_initFiles
      }
    `,
    initFilesRef,
  );

  const pointerEvents = usePointerEvents();
  const { orgId } = useRecoilValue(sessionAtom);
  const [updateItem] = useUpdateNamespaceItem();
  const debouncedUpdate = useDebounce(updateItem, 300);

  const onUpdate = async (updatedDatabase: DatabaseInput) => {
    await debouncedUpdate({
      itemType: 'Database',
      database: {
        itemId: database.itemId,
        ...updatedDatabase,
      },
    });
  };

  const connectionString = useMemo(() => {
    switch (database.database) {
      case 'mysql': {
        return `mysql://root@${database.itemId}-db-service:3306`;
      }
      case 'postgres': {
        return `postgres://postgres@${database.itemId}-db-service:5432`;
      }
      case 'mongodb': {
        return `mongodb://${database.itemId}-db-service:27017`;
      }
      default: {
        return '';
      }
    }
  }, [database]);

  return (
    <CanvasItem namespaceItemRef={database} icon={faDatabase}>
      <DatabaseForm
        key={database.itemId}
        databaseRef={database}
        initFilesRef={initFiles}
        pointerEvents={pointerEvents}
        isDisabled={isDisabled || !!database.namespaceStatus}
        connectionString={connectionString}
        onUpdate={onUpdate}
        orgId={orgId}
      />
    </CanvasItem>
  );
}
