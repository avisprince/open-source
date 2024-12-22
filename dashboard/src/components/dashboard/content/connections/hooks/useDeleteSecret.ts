import { graphql, useMutation } from 'react-relay';
import { useRecoilValue } from 'recoil';

import { sessionAtom } from 'src/recoil/dashboard/dashboard.atoms';

import { useDeleteSecretMutation } from './__generated__/useDeleteSecretMutation.graphql';

export default function useDeleteSecret() {
  const { orgId } = useRecoilValue(sessionAtom);

  const [commitDeleteSecret, isLoading] =
    useMutation<useDeleteSecretMutation>(graphql`
      mutation useDeleteSecretMutation($secretId: ID!) {
        deleteSecret(secretId: $secretId) {
          id
        }
      }
    `);

  const onDelete = (secretId: string) => {
    commitDeleteSecret({
      variables: {
        secretId,
      },
      updater: store => {
        const root = store.getRoot();
        const newSecret = store.getRootField('deleteSecret');
        const secrets = root.getLinkedRecords('orgSecrets', {
          organizationId: orgId,
        });

        const updatedSecrets = secrets?.filter(
          secret => secret.getValue('id') !== newSecret.getValue('id'),
        );

        root.setLinkedRecords(updatedSecrets, 'orgSecrets', {
          organizationId: orgId,
        });
      },
    });
  };

  return [onDelete, isLoading] as const;
}
