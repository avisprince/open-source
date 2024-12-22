import { useCallback } from 'react';
import { useMutation } from 'react-relay';
import { useRecoilValue } from 'recoil';
import { graphql } from 'relay-runtime';

import { sessionAtom } from 'src/recoil/dashboard/dashboard.atoms';

import {
  NamespaceInput,
  useUpdateNamespaceMutation,
} from './__generated__/useUpdateNamespaceMutation.graphql';

export const useUpdateNamespace = () => {
  const { namespaceId } = useRecoilValue(sessionAtom);
  const [commitUpdateNamespace, isUpdateInFlight] =
    useMutation<useUpdateNamespaceMutation>(graphql`
      mutation useUpdateNamespaceMutation(
        $namespaceId: ID!
        $namespace: NamespaceInput!
      ) {
        updateNamespace(namespaceId: $namespaceId, namespace: $namespace) {
          id
          name
        }
      }
    `);

  const update = useCallback(
    (namespace: NamespaceInput) => {
      commitUpdateNamespace({
        variables: {
          namespaceId,
          namespace,
        },
      });
    },
    [commitUpdateNamespace, namespaceId],
  );

  return [update, isUpdateInFlight] as const;
};
