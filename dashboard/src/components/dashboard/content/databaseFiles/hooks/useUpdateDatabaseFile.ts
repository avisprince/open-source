import { graphql, useMutation } from 'react-relay';
import { useRecoilValue } from 'recoil';

import { sessionAtom } from 'src/recoil/dashboard/dashboard.atoms';

import {
  EditDbInitUploadInput,
  useUpdateDatabaseFileMutation,
} from './__generated__/useUpdateDatabaseFileMutation.graphql';

export default function useUpdateDatabaseFile() {
  const { orgId } = useRecoilValue(sessionAtom);

  const [updateDatabaseFile, isLoading] =
    useMutation<useUpdateDatabaseFileMutation>(graphql`
      mutation useUpdateDatabaseFileMutation(
        $fileId: ID!
        $file: EditDbInitUploadInput!
      ) {
        updateDbInitFile(fileId: $fileId, file: $file) {
          id
          fileName
          metadata {
            database
          }
        }
      }
    `);

  const onUpdate = (fileId: string, file: EditDbInitUploadInput) => {
    updateDatabaseFile({
      variables: {
        fileId,
        file,
      },
      updater: (store, { updateDbInitFile }) => {
        const args = {
          organizationId: orgId,
        };

        const root = store.getRoot();

        const initFiles = root
          .getLinkedRecords('orgDbInitFiles', args)
          ?.map(record => {
            if (record.getValue('id') === fileId) {
              record.setValue(updateDbInitFile.fileName, 'fileName');
            }

            return record;
          });

        root
          .getLinkedRecord(`metadata:${updateDbInitFile.id}`)
          ?.setValue(updateDbInitFile.metadata.database, 'database');

        root.setLinkedRecords(initFiles, 'orgDbInitFiles', args);
      },
    });
  };

  return [onUpdate, isLoading] as const;
}
