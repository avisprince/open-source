import { useCallback } from 'react';
import { graphql, useMutation } from 'react-relay';
import { useRecoilValue } from 'recoil';

import { sessionAtom } from 'src/recoil/dashboard/dashboard.atoms';

import {
  DockerRegistrySecretInput,
  useUpdateSecretMutation,
} from './__generated__/useUpdateSecretMutation.graphql';

export default function useUpdateSecret() {
  const { orgId } = useRecoilValue(sessionAtom);

  const [commitUpdateSecret, isLoading] =
    useMutation<useUpdateSecretMutation>(graphql`
      mutation useUpdateSecretMutation(
        $secretId: ID!
        $secret: DockerRegistrySecretInput!
      ) {
        updateSecret(secretId: $secretId, secret: $secret) {
          ...ConnectionCard_secret
        }
      }
    `);

  const onSave = useCallback(
    (secretId: string, secret: DockerRegistrySecretInput) => {
      commitUpdateSecret({
        variables: {
          secretId,
          secret,
        },
        updater: store => {
          const root = store.getRoot();
          const updatedSecret = store.getRootField('updateSecret');
          const secrets = root.getLinkedRecords('orgSecrets', {
            organizationId: orgId,
          });

          const updatedSecrets = secrets?.map(secret => {
            return secret.getValue('id') === secretId ? updatedSecret : secret;
          });

          root.setLinkedRecords(updatedSecrets, 'orgSecrets', {
            organizationId: orgId,
          });
        },
      });
    },
    [commitUpdateSecret, orgId],
  );

  return [onSave, isLoading] as const;
}
