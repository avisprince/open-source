import { useCallback } from 'react';
import { useMutation } from 'react-relay';
import { useRecoilValue } from 'recoil';
import { graphql } from 'relay-runtime';

import { sessionAtom } from 'src/recoil/dashboard/dashboard.atoms';

import { useStartNamespaceItemMutation } from './__generated__/useStartNamespaceItemMutation.graphql';

export default function useStartNamespaceItem(itemId: string) {
  const { namespaceId } = useRecoilValue(sessionAtom);
  const [commitStartNamespaceItem, isStartInFlight] =
    useMutation<useStartNamespaceItemMutation>(graphql`
      mutation useStartNamespaceItemMutation(
        $namespaceId: ID!
        $itemId: String!
      ) {
        startNamespaceItem(namespaceId: $namespaceId, itemId: $itemId)
      }
    `);
  const onStartNamespaceItem = useCallback(() => {
    commitStartNamespaceItem({
      variables: {
        namespaceId,
        itemId,
      },
    });
  }, [commitStartNamespaceItem, namespaceId, itemId]);

  return [onStartNamespaceItem, isStartInFlight] as const;
}
