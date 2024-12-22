import { useCallback } from 'react';
import { useMutation } from 'react-relay';
import { useRecoilValue } from 'recoil';
import { graphql } from 'relay-runtime';

import { sessionAtom } from 'src/recoil/dashboard/dashboard.atoms';

import {
  NamespaceItemPositionInput,
  useUpdateNamespaceItemPositionMutation,
} from './__generated__/useUpdateNamespaceItemPositionMutation.graphql';

export const useUpdateNamespaceItemPosition = () => {
  const { namespaceId } = useRecoilValue(sessionAtom);
  const [updateItemPositionInNamespace, isUpdateInFlight] =
    useMutation<useUpdateNamespaceItemPositionMutation>(graphql`
      mutation useUpdateNamespaceItemPositionMutation(
        $namespaceId: ID!
        $itemPosition: NamespaceItemPositionInput!
      ) {
        updateItemPositionInNamespace(
          namespaceId: $namespaceId
          itemPosition: $itemPosition
        ) {
          itemId
          canvasInfo {
            posX
            posY
          }
        }
      }
    `);

  const updateItemPosition = useCallback(
    (itemPosition: NamespaceItemPositionInput) => {
      updateItemPositionInNamespace({
        variables: {
          namespaceId,
          itemPosition,
        },
        updater: store => {
          const updatedItem = store.getRootField(
            'updateItemPositionInNamespace',
          );
          const updatedItemId = updatedItem.getValue('itemId');
          const canvasInfo = updatedItem.getLinkedRecord('canvasInfo');
          const posX = canvasInfo.getValue('posX');
          const posY = canvasInfo.getValue('posY');

          const namespace = store.get(namespaceId);
          const items = namespace?.getLinkedRecords('items') || [];
          const services = namespace?.getLinkedRecords('services') || [];
          const databases = namespace?.getLinkedRecords('databases') || [];

          [...items, ...services, ...databases].forEach(item => {
            const itemId = item.getValue('itemId');
            if (itemId === updatedItemId) {
              const itemCanvasInfo = item.getLinkedRecord('canvasInfo');
              itemCanvasInfo?.setValue(posX, 'posX');
              itemCanvasInfo?.setValue(posY, 'posY');
            }
          });
        },
      });
    },
    [namespaceId, updateItemPositionInNamespace],
  );

  return [updateItemPosition, isUpdateInFlight] as const;
};
