import { graphql, useMutation } from 'react-relay';
import { useRecoilValue } from 'recoil';

import { sessionAtom } from 'src/recoil/dashboard/dashboard.atoms';

import { useDeleteDatabaseFileMutation } from './__generated__/useDeleteDatabaseFileMutation.graphql';

export default function useDeleteDatabaseFile() {
  const { orgId } = useRecoilValue(sessionAtom);

  const [commitDeleteUpload, isLoading] =
    useMutation<useDeleteDatabaseFileMutation>(graphql`
      mutation useDeleteDatabaseFileMutation($fileId: ID!) {
        deleteUpload(fileId: $fileId) {
          id
        }
      }
    `);

  const onDelete = (fileId: string) => {
    commitDeleteUpload({
      variables: {
        fileId,
      },
      updater: store => {
        const args = {
          organizationId: orgId,
        };

        const root = store.getRoot();
        const initFiles =
          root
            .getLinkedRecords('orgDbInitFiles', args)
            ?.filter(file => file.getValue('id') !== fileId) ?? [];

        root.setLinkedRecords(initFiles, 'orgDbInitFiles', args);

        store.delete(fileId);
      },
    });
  };

  return [onDelete, isLoading] as const;
}
