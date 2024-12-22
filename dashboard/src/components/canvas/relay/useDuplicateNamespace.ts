import { useCallback } from 'react';
import { useMutation } from 'react-relay';
import { useRecoilValue } from 'recoil';
import { graphql } from 'relay-runtime';

import { sessionAtom } from 'src/recoil/dashboard/dashboard.atoms';

import { useDuplicateNamespaceMutation } from './__generated__/useDuplicateNamespaceMutation.graphql';

export const useDuplicateNamespace = () => {
  const { orgId } = useRecoilValue(sessionAtom);

  const [commitDuplicateNamespace, isDuplicationInFlight] =
    useMutation<useDuplicateNamespaceMutation>(graphql`
      mutation useDuplicateNamespaceMutation(
        $organizationId: ID!
        $namespaceId: ID!
      ) {
        duplicateNamespace(
          organizationId: $organizationId
          namespaceId: $namespaceId
        ) {
          id
          ...SelectNamespaceMenu_namespace
        }
      }
    `);

  const onDuplicateNamespace = useCallback(
    (
      namespaceId: string,
      onCompleted?: (duplicatedNamespaceId: string) => void,
    ) => {
      commitDuplicateNamespace({
        variables: {
          organizationId: orgId,
          namespaceId,
        },
        onCompleted: ({ duplicateNamespace }) => {
          if (onCompleted) {
            onCompleted(duplicateNamespace.id);
          }
        },
      });
    },
    [commitDuplicateNamespace, orgId],
  );

  return [onDuplicateNamespace, isDuplicationInFlight] as const;
};
