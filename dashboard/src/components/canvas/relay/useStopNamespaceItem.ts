import { useCallback } from 'react';
import { useMutation } from 'react-relay';
import { useRecoilValue } from 'recoil';
import { graphql } from 'relay-runtime';

import { sessionAtom } from 'src/recoil/dashboard/dashboard.atoms';

import { useStopNamespaceItemMutation } from './__generated__/useStopNamespaceItemMutation.graphql';

export default function useStopNamespaceItem(itemId: string) {
  const { namespaceId } = useRecoilValue(sessionAtom);
  const [commitStopNamespaceItem, isStopInFlight] =
    useMutation<useStopNamespaceItemMutation>(graphql`
      mutation useStopNamespaceItemMutation(
        $namespaceId: ID!
        $itemId: String!
      ) {
        terminateNamespaceItem(namespaceId: $namespaceId, itemId: $itemId)
      }
    `);

  const onStopNamespaceItem = useCallback(() => {
    commitStopNamespaceItem({
      variables: {
        namespaceId,
        itemId,
      },
    });
  }, [commitStopNamespaceItem, namespaceId, itemId]);

  return [onStopNamespaceItem, isStopInFlight] as const;
}
