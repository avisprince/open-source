import { useCallback } from 'react';
import { useMutation } from 'react-relay';
import { useRecoilValue } from 'recoil';
import { graphql } from 'relay-runtime';

import { sessionAtom } from 'src/recoil/dashboard/dashboard.atoms';

import {
  NamespaceItemInput,
  useUpdateNamespaceItemMutation,
} from './__generated__/useUpdateNamespaceItemMutation.graphql';

export const useUpdateNamespaceItem = () => {
  const { namespaceId } = useRecoilValue(sessionAtom);
  const [commitUpdateItemInNamespace, isUpdateInFlight] =
    useMutation<useUpdateNamespaceItemMutation>(graphql`
      mutation useUpdateNamespaceItemMutation(
        $namespaceId: ID!
        $item: NamespaceItemInput!
      ) {
        updateItemInNamespace(namespaceId: $namespaceId, item: $item) {
          ...CanvasItems_namespaceItems
        }
      }
    `);

  const updateItem = useCallback(
    (item: NamespaceItemInput) => {
      commitUpdateItemInNamespace({
        variables: {
          namespaceId,
          item,
        },
      });
    },
    [namespaceId, commitUpdateItemInNamespace],
  );

  return [updateItem, isUpdateInFlight] as const;
};
