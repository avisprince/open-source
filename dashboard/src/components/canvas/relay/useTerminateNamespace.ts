import { useCallback } from 'react';
import { useMutation } from 'react-relay';
import { graphql } from 'relay-runtime';

import { useTerminateNamespaceMutation } from './__generated__/useTerminateNamespaceMutation.graphql';

export const useTerminateNamespace = () => {
  const [commitTerminateNamespace, isTerminationInFlight] =
    useMutation<useTerminateNamespaceMutation>(graphql`
      mutation useTerminateNamespaceMutation($namespaceId: ID!) {
        terminateNamespace(namespaceId: $namespaceId) {
          id
          status
          items {
            itemId
            namespaceStatus
            ...CanvasItems_namespaceItems
          }
        }
      }
    `);

  const terminate = useCallback(
    (namespaceId: string) => {
      commitTerminateNamespace({
        variables: {
          namespaceId,
        },
      });
    },
    [commitTerminateNamespace],
  );

  return [terminate, isTerminationInFlight] as const;
};
