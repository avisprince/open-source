import { useCallback } from 'react';
import { graphql, useMutation } from 'react-relay';
import { useRecoilValue } from 'recoil';

import { sessionAtom } from 'src/recoil/dashboard/dashboard.atoms';

import {
  DockerRegistrySecretInput,
  useCreateSecretMutation,
} from './__generated__/useCreateSecretMutation.graphql';

export default function useCreateSecret() {
  const { orgId } = useRecoilValue(sessionAtom);

  const [commitCreateSecret, isLoading] =
    useMutation<useCreateSecretMutation>(graphql`
      mutation useCreateSecretMutation(
        $organizationId: ID!
        $secret: DockerRegistrySecretInput!
      ) {
        createSecret(organizationId: $organizationId, secret: $secret) {
          ...ConnectionCard_secret
        }
      }
    `);

  const onCreateSecret = useCallback(
    (secret: DockerRegistrySecretInput) => {
      commitCreateSecret({
        variables: {
          organizationId: orgId,
          secret,
        },
        updater: store => {
          const root = store.getRoot();
          const newSecret = store.getRootField('createSecret');
          const secrets = root.getLinkedRecords('orgSecrets', {
            organizationId: orgId,
          });

          const updatedSecrets = secrets
            ? [...secrets, newSecret]
            : [newSecret];

          root.setLinkedRecords(updatedSecrets, 'orgSecrets', {
            organizationId: orgId,
          });
        },
      });
    },
    [commitCreateSecret, orgId],
  );

  return [onCreateSecret, isLoading] as const;
}
