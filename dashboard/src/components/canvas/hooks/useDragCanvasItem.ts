import { KonvaEventObject } from 'konva/lib/Node';
import { Dictionary } from 'lodash';
import { useState } from 'react';
import {
  commitLocalUpdate,
  graphql,
  useLazyLoadQuery,
  useRelayEnvironment,
} from 'react-relay';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import usePublishCanvasData from 'src/components/canvas/hooks/usePublishCanvasData';
import { useUpdateNamespaceItemPosition } from 'src/components/canvas/relay/useUpdateNamespaceItemPosition';
import { sendItemToTop } from 'src/components/canvas/utils/utils';
import {
  canvasActionStatusAtom,
  focusedCanvasItemAtom,
  selectedCanvasItemsAtom,
  sessionAtom,
} from 'src/recoil/dashboard/dashboard.atoms';
import { addToSet, deleteFromSet } from 'src/util/util';

import { useDragCanvasItemQuery } from './__generated__/useDragCanvasItemQuery.graphql';

export default function useDragCanvasItem(itemId: string) {
  const environment = useRelayEnvironment();
  const { namespaceId } = useRecoilValue(sessionAtom);
  const data = useLazyLoadQuery<useDragCanvasItemQuery>(
    graphql`
      query useDragCanvasItemQuery($namespaceId: ID!) {
        namespace(namespaceId: $namespaceId) {
          items {
            itemId
            itemType
            canvasInfo {
              posX
              posY
            }
          }
        }
      }
    `,
    {
      namespaceId,
    },
  );

  const [updateItemPosition] = useUpdateNamespaceItemPosition();
  const publishData = usePublishCanvasData();
  const [selectedCanvasItems, setSelectedCanvasItems] = useRecoilState(
    selectedCanvasItemsAtom,
  );
  const setFocusedItem = useSetRecoilState(focusedCanvasItemAtom);
  const setCanvasActionStatus = useSetRecoilState(canvasActionStatusAtom);
  const [cachedItemsPos, setCachedItemsPos] = useState<
    Dictionary<{ itemId: string; itemType: string; x: number; y: number }>
  >({});

  const onItemClick = () => {
    setFocusedItem(itemId);
    if (!selectedCanvasItems.has(itemId)) {
      setSelectedCanvasItems(new Set([itemId]));
    }
  };

  const onDragItemStart = (e: KonvaEventObject<DragEvent>) => {
    // Need to manipulate the DOM directly to get the proper canvas order
    Array.from(selectedCanvasItems).map(id => sendItemToTop(id));
    sendItemToTop(itemId);

    const positions = data.namespace.items
      .filter(
        item => item.itemId === itemId || selectedCanvasItems.has(item.itemId),
      )
      .reduce((agg, item) => {
        return {
          ...agg,
          [item.itemId]: {
            itemId: item.itemId,
            itemType: item.itemType,
            x: item.itemId === itemId ? e.target.x() : item.canvasInfo.posX,
            y: item.itemId === itemId ? e.target.y() : item.canvasInfo.posY,
          },
        };
      }, {});

    setCachedItemsPos(positions);
    setCanvasActionStatus(curr => addToSet(curr, 'dragging'));
  };

  const onDragItem = (e: KonvaEventObject<DragEvent>) => {
    const { x, y } = cachedItemsPos[itemId];
    const deltaX = e.target.x() - x;
    const deltaY = e.target.y() - y;

    Object.values(cachedItemsPos).forEach(({ itemId, itemType, x, y }) => {
      const posX = x + deltaX;
      const posY = y + deltaY;

      publishData({
        type: 'item',
        itemId,
        itemType,
        x: posX,
        y: posY,
      });

      commitLocalUpdate(environment, store => {
        const namespace = store.get(namespaceId);
        const items = namespace?.getLinkedRecords('items') || [];
        const services = namespace?.getLinkedRecords('services') || [];
        const databases = namespace?.getLinkedRecords('databases') || [];

        [...items, ...services, ...databases].forEach(item => {
          const cachedItemId = item.getValue('itemId');
          if (itemId === cachedItemId) {
            const itemCanvasInfo = item.getLinkedRecord('canvasInfo');
            itemCanvasInfo?.setValue(posX, 'posX');
            itemCanvasInfo?.setValue(posY, 'posY');
          }
        });
      });
    });
  };

  const onDragItemEnd = async (e: KonvaEventObject<DragEvent>) => {
    const { x, y } = cachedItemsPos[itemId];
    const deltaX = e.target.x() - x;
    const deltaY = e.target.y() - y;

    const items = data.namespace.items.filter(
      item => item.itemId === itemId || selectedCanvasItems.has(item.itemId),
    );

    const promises = items.map(async item => {
      await updateItemPosition({
        itemId: item.itemId,
        canvasInfo: {
          ...item.canvasInfo,
          posX:
            item.itemId === itemId
              ? e.target.x()
              : cachedItemsPos[item.itemId].x + deltaX,
          posY:
            item.itemId === itemId
              ? e.target.y()
              : cachedItemsPos[item.itemId].y + deltaY,
        },
      });
    });

    await Promise.all(promises);
    setCachedItemsPos({});
    setCanvasActionStatus(curr => deleteFromSet(curr, 'dragging'));
  };

  return {
    onItemClick,
    onDragItemStart,
    onDragItem,
    onDragItemEnd,
  };
}
