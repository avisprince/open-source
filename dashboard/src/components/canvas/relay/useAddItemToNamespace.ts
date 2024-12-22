import { useCallback } from 'react';
import { useMutation } from 'react-relay';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { graphql } from 'relay-runtime';

import { CanvasItemType } from 'src/components/canvas/Canvas';
import { useAddItemToNamespaceMutation } from 'src/components/canvas/relay/__generated__/useAddItemToNamespaceMutation.graphql';
import { getCanvasItemDefaults } from 'src/components/canvas/utils/canvasItemDefaults';
import {
  selectedCanvasItemsAtom,
  sessionAtom,
} from 'src/recoil/dashboard/dashboard.atoms';

export default function useAddItemToNamespace() {
  const { namespaceId } = useRecoilValue(sessionAtom);
  const setSelectedCanvasItems = useSetRecoilState(selectedCanvasItemsAtom);
  const [commitAddItemToNamespace, isAddItemInFlight] =
    useMutation<useAddItemToNamespaceMutation>(graphql`
      mutation useAddItemToNamespaceMutation(
        $namespaceId: ID!
        $item: NewNamespaceItemInput!
      ) {
        addItemToNamespace(namespaceId: $namespaceId, item: $item) {
          itemId
        }
      }
    `);

  const addItem = useCallback(
    (itemType: CanvasItemType, posX: number, posY: number) => {
      const { displayName } = getCanvasItemDefaults(itemType);

      commitAddItemToNamespace({
        variables: {
          namespaceId,
          item: {
            itemType,
            displayName,
            canvasInfo: {
              posX,
              posY,
            },
          },
        },
        onCompleted: response => {
          setSelectedCanvasItems(new Set([response.addItemToNamespace.itemId]));
        },
      });
    },
    [commitAddItemToNamespace, namespaceId, setSelectedCanvasItems],
  );

  return [addItem, isAddItemInFlight] as const;
}
