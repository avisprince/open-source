import { useCallback } from 'react';
import { useMutation } from 'react-relay';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { graphql } from 'relay-runtime';

import {
  selectedCanvasItemsAtom,
  sessionAtom,
} from 'src/recoil/dashboard/dashboard.atoms';

import { useDuplicateNamespaceItemMutation } from './__generated__/useDuplicateNamespaceItemMutation.graphql';

export const useDuplicateNamespaceItem = () => {
  const { namespaceId } = useRecoilValue(sessionAtom);
  const setSelectedCanvasItems = useSetRecoilState(selectedCanvasItemsAtom);

  const [commitDuplicateNamespaceItem, isDuplicationInFlight] =
    useMutation<useDuplicateNamespaceItemMutation>(graphql`
      mutation useDuplicateNamespaceItemMutation(
        $namespaceId: ID!
        $itemId: String!
        $posX: Float!
        $posY: Float!
      ) {
        duplicateNamespaceItem(
          namespaceId: $namespaceId
          itemId: $itemId
          posX: $posX
          posY: $posY
        ) {
          itemId
        }
      }
    `);

  const duplicateItem = useCallback(
    (itemId: string, posX: number, posY: number) => {
      commitDuplicateNamespaceItem({
        variables: {
          namespaceId,
          itemId,
          posX,
          posY,
        },
        onCompleted: data => {
          setSelectedCanvasItems(new Set([data.duplicateNamespaceItem.itemId]));
        },
      });
    },
    [commitDuplicateNamespaceItem, namespaceId, setSelectedCanvasItems],
  );

  return [duplicateItem, isDuplicationInFlight] as const;
};
