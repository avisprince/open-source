import { useCallback } from 'react';
import { useMutation } from 'react-relay';
import { useRecoilValue } from 'recoil';
import { graphql } from 'relay-runtime';

import { sessionAtom } from 'src/recoil/dashboard/dashboard.atoms';

import { useStartNamespaceMutation } from './__generated__/useStartNamespaceMutation.graphql';

export const useStartNamespace = () => {
  const { namespaceId } = useRecoilValue(sessionAtom);
  const [commitStartNamespace, isStartInFlight] =
    useMutation<useStartNamespaceMutation>(graphql`
      mutation useStartNamespaceMutation($namespaceId: ID!) {
        startNamespace(namespaceId: $namespaceId) {
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

  const start = useCallback(() => {
    commitStartNamespace({
      variables: {
        namespaceId,
      },
    });
  }, [commitStartNamespace, namespaceId]);

  return [start, isStartInFlight] as const;
};
