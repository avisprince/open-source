import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ReactNode, useState } from 'react';
import { Group, Rect } from 'react-konva';
import { Html } from 'react-konva-utils';
import {
  RelayEnvironmentProvider,
  graphql,
  useFragment,
  useRelayEnvironment,
} from 'react-relay';
import { useRecoilValue } from 'recoil';

import useCanvasItemDimensions from 'src/components/canvas/hooks/useCanvasItemDimensions';
import useDragCanvasItem from 'src/components/canvas/hooks/useDragCanvasItem';
import CanvasDetailsHealthIcon from 'src/components/canvas/itemDetails/CanvasDetailsHealthIcon';
import { setCursor } from 'src/components/canvas/utils/utils';
import Flexbox from 'src/components/custom/Flexbox';
import { DokkimiColors } from 'src/components/styles/colors';
import stylist from 'src/components/styles/stylist';
import {
  focusedCanvasItemAtom,
  hoveredCanvasItemAtom,
  selectedCanvasItemsAtom,
} from 'src/recoil/dashboard/dashboard.atoms';
import { Stylesheet } from 'src/types/Stylesheet';

import { CanvasItem_namespaceItem$key } from './__generated__/CanvasItem_namespaceItem.graphql';

type Props = {
  namespaceItemRef: CanvasItem_namespaceItem$key;
  children: ReactNode;
  icon: IconDefinition;
  showHealthIcon?: boolean;
  headerAction?: ReactNode;
  displayName?: ReactNode;
};

export default function CanvasItem({
  namespaceItemRef,
  children,
  icon,
  showHealthIcon = true,
  headerAction,
  displayName,
}: Props) {
  const item = useFragment(
    graphql`
      fragment CanvasItem_namespaceItem on NamespaceItem {
        itemId
        displayName
        namespaceStatus
        canvasInfo {
          posX
          posY
        }
        ...useCanvasItemDimensions_namespaceItem
      }
    `,
    namespaceItemRef,
  );

  const environment = useRelayEnvironment();

  const { onItemClick, onDragItemStart, onDragItem, onDragItemEnd } =
    useDragCanvasItem(item.itemId);

  const { height, width, componentRef } = useCanvasItemDimensions(item);
  const hoveredItem = useRecoilValue(hoveredCanvasItemAtom);
  const selectedCanvasItems = useRecoilValue(selectedCanvasItemsAtom);
  const focusedCanvasItem = useRecoilValue(focusedCanvasItemAtom);
  const [isInnerHover, setIsInnerHover] = useState<boolean>(false);

  const isActive =
    selectedCanvasItems.has(item.itemId) ||
    hoveredItem === item.itemId ||
    isInnerHover;

  return (
    <Group
      draggable
      x={item.canvasInfo.posX}
      y={item.canvasInfo.posY}
      onMouseDown={onItemClick}
      onDragStart={onDragItemStart}
      onDragMove={onDragItem}
      onDragEnd={onDragItemEnd}
      onMouseEnter={e => setCursor(e, 'pointer')}
      onMouseLeave={e => setCursor(e, 'default')}
    >
      <Rect x={0} y={0} width={width} height={height} shadowBlur={10} />
      <Html
        divProps={{
          style: {
            pointerEvents: 'none',
            zIndex: focusedCanvasItem === item.itemId ? 20 : 10,
          },
        }}
      >
        <div
          ref={componentRef}
          className={item.itemId}
          style={stylist([
            styles.container,
            {
              width,
              borderColor: isActive
                ? DokkimiColors.accentBackgroundColor
                : DokkimiColors.blackBorderColor,
            },
          ])}
          onMouseDown={onItemClick}
          onMouseEnter={() => setIsInnerHover(true)}
          onMouseLeave={() => setIsInnerHover(false)}
        >
          <Flexbox alignItems="center" fullWidth style={styles.header} gap={16}>
            <FontAwesomeIcon icon={icon} size="lg" />
            <div style={styles.headerName}>
              {displayName ?? item.displayName}
            </div>
            {showHealthIcon && (
              <CanvasDetailsHealthIcon namespaceStatus={item.namespaceStatus} />
            )}
            {headerAction}
          </Flexbox>
          <RelayEnvironmentProvider environment={environment}>
            {children}
          </RelayEnvironmentProvider>
        </div>
      </Html>
    </Group>
  );
}

const styles: Stylesheet = {
  container: {
    backgroundColor: DokkimiColors.blackBackgroundColor,
    borderRadius: 8,
    border: '1px solid rgba(0, 0, 0, 0.14)',
    overflow: 'hidden',
    cursor: 'pointer',
  },
  header: {
    height: 56,
    padding: 16,
    background: DokkimiColors.defaultBackgroundColor,
  },
  headerName: {
    flexGrow: 1,
  },
};
