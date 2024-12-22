import Konva from 'konva';
import { KonvaEventObject } from 'konva/lib/Node';
import React, { useMemo, useRef, useState } from 'react';
import { Layer, Stage } from 'react-konva';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import CanvasActiveUsers from 'src/components/canvas/CanvasActiveUserPointers';
import CanvasContextMenu from 'src/components/canvas/CanvasContextMenu';
import CanvasHeader from 'src/components/canvas/CanvasHeader';
import CanvasItemContextMenu from 'src/components/canvas/CanvasItemContextMenu';
import CanvasItems from 'src/components/canvas/CanvasItems';
import CanvasSelectRectangle from 'src/components/canvas/CanvasSelectRectangle';
import CanvasSidebar from 'src/components/canvas/CanvasSidebar';
import { SCROLL_SCALE, useCanvas } from 'src/components/canvas/hooks/useCanvas';
import useGetCanvasItemDimensions from 'src/components/canvas/hooks/useGetCanvasItemDimensions';
import useAddItemToNamespace from 'src/components/canvas/relay/useAddItemToNamespace';
import useAddTemplateToNamespace from 'src/components/canvas/relay/useAddTemplateToNamespace';
import { useCanvasSubscriptions } from 'src/components/canvas/relay/useCanvasSubscriptions';
import { useDuplicateNamespaceItem } from 'src/components/canvas/relay/useDuplicateNamespaceItem';
import { isOverlapping } from 'src/components/canvas/utils/utils';
import { DokkimiColors } from 'src/components/styles/colors';
import {
  canvasActionStatusAtom,
  canvasScaleAtom,
  hoveredCanvasItemAtom,
  hoveringContextMenuAtom,
  mouseOffCanvasAtom,
  newCanvasItemDragTypeAtom,
  selectedCanvasItemsAtom,
  sessionAtom,
} from 'src/recoil/dashboard/dashboard.atoms';
import { Stylesheet } from 'src/types/Stylesheet';
import { addToSet, deleteFromSet } from 'src/util/util';

import { CanvasQuery } from './__generated__/CanvasQuery.graphql';

export type CanvasItemType =
  | 'Service'
  | 'Database'
  | 'HttpRequest'
  | 'MockEndpoint'
  | 'DbQuery'
  | 'TrafficHistory'
  | 'QueryHistory';

const initialSelectRect = {
  initialX: 0,
  initialY: 0,
  x: 0,
  y: 0,
  width: 0,
  height: 0,
};

const showActiveUsers = false;

export default function Canvas() {
  const { namespaceId, orgId } = useRecoilValue(sessionAtom);
  const stageRef = useRef<Konva.Stage | null>(null);

  const data = useLazyLoadQuery<CanvasQuery>(
    graphql`
      query CanvasQuery($organizationId: ID!, $namespaceId: ID!) {
        namespace(namespaceId: $namespaceId) {
          status
          items {
            itemId
            itemType
            canvasInfo {
              posX
              posY
            }
            ...CanvasItemContextMenu_namespaceItem
          }
          activeUsers {
            ...CanvasActiveUserPointers_activeUsers
          }
        }
        namespaceItemTemplates(organizationId: $organizationId) {
          ...CanvasContextMenu_namespaceItemTemplates
        }
        ...CanvasHeader_query
          @arguments(organizationId: $organizationId, namespaceId: $namespaceId)
        ...CanvasSidebar_query
          @arguments(organizationId: $organizationId, namespaceId: $namespaceId)
        ...CanvasItems_query
          @arguments(organizationId: $organizationId, namespaceId: $namespaceId)
      }
    `,
    {
      organizationId: orgId,
      namespaceId: namespaceId,
    },
  );

  // useSharedCanvas(data.namespace.activeUsers);
  useCanvasSubscriptions();

  const {
    mousePosition,
    getMousePosition,
    scrollOffset,
    setScrollOffset,
    showContextMenu,
    setShowContextMenu,
    showCanvasContextMenu,
    setShowCanvasContextMenu,
  } = useCanvas(stageRef);
  const setMouseOffCanvas = useSetRecoilState(mouseOffCanvasAtom);
  const [canvasActionStatus, setCanvasActionStatus] = useRecoilState(
    canvasActionStatusAtom,
  );
  const [hoveredItem, setHoveredItem] = useRecoilState(hoveredCanvasItemAtom);
  const scale = useRecoilValue(canvasScaleAtom);
  const setSelectedCanvasItems = useSetRecoilState(selectedCanvasItemsAtom);
  const [dragType, setDragType] = useRecoilState(newCanvasItemDragTypeAtom);
  const hoveringContextMenu = useRecoilValue(hoveringContextMenuAtom);
  const [contextPos, setContextPos] = useState({
    x: 0,
    y: 0,
    canvasX: 0,
    canvasY: 0,
  });
  const [selectRectInfo, setSelectRectInfo] = useState(initialSelectRect);
  const getCanvasItemDimensions = useGetCanvasItemDimensions();

  const [addItemToNamespace] = useAddItemToNamespace();
  const [duplicateNamespaceItem] = useDuplicateNamespaceItem();
  const [addTemplateToNamespace] = useAddTemplateToNamespace();

  const onAddItem = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    if (dragType === null) {
      return;
    }

    stageRef.current?.setPointersPositions(e);
    const { x, y } = getMousePosition();
    if (dragType.templateId) {
      addTemplateToNamespace(dragType.templateId, {
        posX: x,
        posY: y,
      });
    } else {
      addItemToNamespace(dragType.type, x, y);
    }
    setDragType(null);
  };

  const onDuplicateItem = async (itemId: string) => {
    await duplicateNamespaceItem(
      itemId,
      mousePosition.current.x,
      mousePosition.current.y,
    );
  };

  const onMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    if (e.evt.button === 1) {
      setCanvasActionStatus(curr => addToSet(curr, 'dragging'));
      return;
    }

    if (
      e.evt.button === 0 &&
      !canvasActionStatus.size &&
      !(showContextMenu || showCanvasContextMenu)
    ) {
      e.evt.preventDefault();
      setCanvasActionStatus(curr => addToSet(curr, 'selecting'));
      setSelectedCanvasItems(new Set());
      const x = mousePosition.current.x;
      const y = mousePosition.current.y;

      setSelectRectInfo({
        initialX: x,
        initialY: y,
        x,
        y,
        width: 0,
        height: 0,
      });
    }
  };

  const onMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    if (canvasActionStatus.has('selecting')) {
      e.evt.preventDefault();
      const x = mousePosition.current.x;
      const y = mousePosition.current.y;

      const rectInfo = {
        x: Math.min(x, selectRectInfo.initialX),
        y: Math.min(y, selectRectInfo.initialY),
        width: Math.abs(x - selectRectInfo.initialX),
        height: Math.abs(y - selectRectInfo.initialY),
      };

      setSelectRectInfo(curr => ({
        ...curr,
        ...rectInfo,
      }));

      data.namespace.items.forEach(item => {
        const { height, width } = getCanvasItemDimensions(
          item.itemId,
          item.itemType,
        );
        const isHovering = isOverlapping(rectInfo, {
          x: item.canvasInfo.posX,
          y: item.canvasInfo.posY,
          height,
          width,
        });

        setSelectedCanvasItems(curr =>
          isHovering
            ? addToSet(curr, item.itemId)
            : deleteFromSet(curr, item.itemId),
        );
      });
    } else if (canvasActionStatus.has('dragging')) {
      e.evt.preventDefault();
      setScrollOffset(curr => ({
        x: curr.x + ((e.evt.movementX * -1) / scale) * SCROLL_SCALE,
        y: curr.y + ((e.evt.movementY * -1) / scale) * SCROLL_SCALE,
      }));
    } else {
      const overlapping = data.namespace.items.find(item => {
        const { height, width } = getCanvasItemDimensions(
          item.itemId,
          item.itemType,
        );
        return isOverlapping(
          {
            x: item.canvasInfo.posX,
            y: item.canvasInfo.posY,
            height,
            width,
          },
          {
            x: mousePosition.current.x,
            y: mousePosition.current.y,
            height: 0,
            width: 0,
          },
        );
      });

      if (!overlapping) {
        if (!!hoveredItem) {
          setHoveredItem(null);
          setCanvasActionStatus(curr => deleteFromSet(curr, 'hovering'));
        }
      } else {
        if (!hoveredItem) {
          setHoveredItem(overlapping.itemId);
          setCanvasActionStatus(curr => addToSet(curr, 'hovering'));
        }
      }
    }
  };

  const onMouseUp = (e: KonvaEventObject<MouseEvent>) => {
    e.evt.preventDefault();
    setCanvasActionStatus(curr => deleteFromSet(curr, 'selecting'));
    setCanvasActionStatus(curr => deleteFromSet(curr, 'dragging'));
    setSelectRectInfo(initialSelectRect);
  };

  const hoveredNamespaceItem = useMemo(
    () => data.namespace.items.find(item => item.itemId === hoveredItem),
    [hoveredItem, data.namespace.items],
  );

  const contextMenuNamespaceItem = useMemo(() => {
    return (
      data.namespace.items.find(item => item.itemId === showContextMenu) ?? null
    );
  }, [data.namespace.items, showContextMenu]);

  return (
    <div
      key={namespaceId}
      style={styles.canvas}
      onDrop={onAddItem}
      onDragOver={e => e.preventDefault()}
      onMouseDown={() => {
        if (!hoveringContextMenu) {
          setShowContextMenu(null);
          setShowCanvasContextMenu(false);
        }
      }}
      onContextMenu={e => {
        e.preventDefault();
        setContextPos({
          x: e.pageX,
          y: e.pageY,
          canvasX: mousePosition.current.x,
          canvasY: mousePosition.current.y,
        });

        if (
          hoveredItem &&
          hoveredNamespaceItem?.itemType !== 'TrafficHistory' &&
          hoveredNamespaceItem?.itemType !== 'QueryHistory'
        ) {
          setShowContextMenu(hoveredNamespaceItem?.itemId ?? null);
        } else {
          setShowCanvasContextMenu(true);
        }
      }}
    >
      {contextMenuNamespaceItem && (
        <CanvasItemContextMenu
          namespaceItemRef={contextMenuNamespaceItem}
          pos={contextPos}
          namespaceStatus={data.namespace.status}
          onClose={() => setShowContextMenu(null)}
          onDuplicate={onDuplicateItem}
        />
      )}
      {showCanvasContextMenu && (
        <CanvasContextMenu
          templatesRef={data.namespaceItemTemplates}
          pos={contextPos}
          onClose={() => setShowCanvasContextMenu(false)}
        />
      )}
      <div style={styles.header}>
        <CanvasHeader queryRef={data} />
      </div>
      <div style={styles.canvasSidebar}>
        <CanvasSidebar queryRef={data} stageRef={stageRef} />
      </div>
      <Stage
        height={window.innerHeight}
        width={window.innerWidth}
        offset={scrollOffset}
        style={styles.stage}
        ref={stageRef}
        scale={{ x: scale, y: scale }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={() => setMouseOffCanvas(true)}
        onMouseEnter={() => setMouseOffCanvas(false)}
      >
        <Layer>
          <CanvasItems queryRef={data} />
          <CanvasSelectRectangle
            x={selectRectInfo.x}
            y={selectRectInfo.y}
            height={selectRectInfo.height}
            width={selectRectInfo.width}
            visible={
              canvasActionStatus.has('selecting') && !showCanvasContextMenu
            }
          />
          {showActiveUsers && (
            <CanvasActiveUsers activeUsersRef={data.namespace.activeUsers} />
          )}
        </Layer>
      </Stage>
    </div>
  );
}

const styles = {
  canvas: {
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
  },
  canvasSidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 1000,
  },
  header: {
    position: 'absolute',
    top: 4,
    right: 4,
    zIndex: 1000,
  },
  stage: {
    backgroundColor: DokkimiColors.blackBorderColor,
    // backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23414141' fill-opacity='1'%3E%3Cpath opacity='.5' d='M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z'/%3E%3Cpath d='M6 5V0H5v5H0v1h5v94h1V6h94V5H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
  },
} satisfies Stylesheet;
