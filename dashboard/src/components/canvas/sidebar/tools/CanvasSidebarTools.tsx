import { Divider, Input } from '@fluentui/react-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import clsx from 'clsx';
import { Stage } from 'konva/lib/Stage';
import { useMemo, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { graphql, useFragment } from 'react-relay';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import useGetCanvasItemDimensions from 'src/components/canvas/hooks/useGetCanvasItemDimensions';
import CanvasTools from 'src/components/canvas/sidebar/tools/CanvasTools';
import { CanvasItemIcons } from 'src/components/canvas/utils/canvasItemDefaults';
import Flexbox from 'src/components/custom/Flexbox';
import Icon from 'src/components/custom/Icon';
import { DokkimiColorsV2 } from 'src/components/styles/colors';
import {
  canvasOffsetAtom,
  canvasScaleAtom,
  focusedCanvasItemAtom,
  hoveredCanvasItemAtom,
  selectedCanvasItemsAtom,
} from 'src/recoil/dashboard/dashboard.atoms';

import {
  CanvasSidebarTools_items$data,
  CanvasSidebarTools_items$key,
} from './__generated__/CanvasSidebarTools_items.graphql';

type Props = {
  itemsRef: CanvasSidebarTools_items$key;
  stageRef: React.MutableRefObject<Stage | null>;
};

export default function CanvasSidebarTools({ itemsRef, stageRef }: Props) {
  const styles = useStyles();

  const [itemFilter, setItemFilter] = useState('');
  const setFocusedItem = useSetRecoilState(focusedCanvasItemAtom);
  const canvasScale = useRecoilValue(canvasScaleAtom);
  const setScrollOffset = useSetRecoilState(canvasOffsetAtom);
  const [selectedCanvasItems, setSelectedCanvasItems] = useRecoilState(
    selectedCanvasItemsAtom,
  );
  const [hoveredCanvasItem, setHoveredCanvasItem] = useRecoilState(
    hoveredCanvasItemAtom,
  );

  const items = useFragment(
    graphql`
      fragment CanvasSidebarTools_items on NamespaceItem @relay(plural: true) {
        itemId
        itemType
        displayName
        canvasInfo {
          posX
          posY
        }
        usage {
          cpu
          memory
        }
      }
    `,
    itemsRef,
  );

  const getCanvasItemDimensions = useGetCanvasItemDimensions();

  const onItemClick = (item: CanvasSidebarTools_items$data[number]) => {
    // Reset position which is set by zooming
    stageRef.current?.position({ x: 0, y: 0 });

    setFocusedItem(item.itemId);
    if (!selectedCanvasItems.has(item.itemId)) {
      setSelectedCanvasItems(new Set([item.itemId]));
    }

    const { height, width } = getCanvasItemDimensions(
      item.itemId,
      item.itemType,
    );
    const { posX, posY } = item.canvasInfo;
    const itemCenterX = (posX + width / 2) * canvasScale;
    const itemCenterY = (posY + height / 2) * canvasScale;

    setScrollOffset({
      x: (itemCenterX - window.innerWidth / 2) / canvasScale,
      y: (itemCenterY - window.innerHeight / 2) / canvasScale,
    });
  };

  const isSelected = (itemId: string) => {
    return selectedCanvasItems.has(itemId) || itemId === hoveredCanvasItem;
  };

  const getDisplayName = (item: CanvasSidebarTools_items$data[number]) => {
    if (
      item.itemType === 'TrafficHistory' ||
      item.itemType === 'QueryHistory'
    ) {
      const [id1, id2] = item.displayName.split('-');
      const item1 = items.find(item => item.itemId === id1);
      const item2 = items.find(item => item.itemId === id2);

      return (
        <Flexbox
          alignItems="center"
          gap={4}
          className={clsx(styles.itemText, {
            [styles.selectedItemText]: isSelected(item.itemId),
          })}
        >
          <div>{item1?.displayName}</div>
          <Icon name="arrowLeftRight" size={20} />
          <div>{item2?.displayName}</div>
        </Flexbox>
      );
    }

    return (
      <div
        className={clsx(styles.itemText, {
          [styles.selectedItemText]: isSelected(item.itemId),
        })}
      >
        {item.displayName}
      </div>
    );
  };

  const orderedItems = useMemo(() => {
    const services = items.filter(i => i.itemType === 'Service');
    const databases = items.filter(i => i.itemType === 'Database');
    const others = items.filter(
      i => i.itemType !== 'Service' && i.itemType !== 'Database',
    );

    return [...services, ...databases, ...others];
  }, [items]);

  return (
    <Flexbox direction="column" grow={1} className={styles.container} gap={16}>
      <Flexbox direction="column" gap={8}>
        <div>Drag in a New Item</div>
        <CanvasTools />
      </Flexbox>
      <Divider />
      <Flexbox
        direction="column"
        gap={8}
        fullHeight
        style={{ overflow: 'hidden' }}
      >
        <div>Sandbox Items</div>
        <Input
          value={itemFilter}
          onChange={e => setItemFilter(e.target.value)}
          placeholder="Search..."
        />
        <Flexbox direction="column" gap={4} className={styles.itemsList}>
          {orderedItems
            .filter(item =>
              item.displayName
                .toLocaleLowerCase()
                .includes(itemFilter.toLocaleLowerCase()),
            )
            .map(item => {
              return (
                <Flexbox
                  key={item.itemId}
                  justifyContent="center"
                  direction="column"
                  gap={4}
                  onClick={() => onItemClick(item)}
                  className={clsx(styles.item, {
                    [styles.selectedItem]:
                      selectedCanvasItems.has(item.itemId) ||
                      hoveredCanvasItem === item.itemId,
                  })}
                  onMouseEnter={() => setHoveredCanvasItem(item.itemId)}
                  onMouseLeave={() => setHoveredCanvasItem(null)}
                >
                  <Flexbox alignItems="center" gap={8}>
                    <Flexbox
                      alignItems="center"
                      justifyContent="center"
                      className={clsx(styles.itemIcon, {
                        [styles.selectedItemIcon]: isSelected(item.itemId),
                      })}
                    >
                      <FontAwesomeIcon icon={CanvasItemIcons[item.itemType]} />
                    </Flexbox>
                    {getDisplayName(item)}
                  </Flexbox>
                  {item.usage && (
                    <Flexbox
                      alignItems="center"
                      gap={16}
                      className={styles.itemUsage}
                    >
                      <Flexbox alignItems="center" gap={8}>
                        <div className={styles.cpuTitle}>CPU:</div>
                        <div>{item.usage.cpu.toFixed(2)}m</div>
                      </Flexbox>
                      <Flexbox alignItems="center" gap={8}>
                        <div className={styles.ramTitle}>RAM:</div>
                        <div>{item.usage.memory.toFixed(2)}Mi</div>
                      </Flexbox>
                    </Flexbox>
                  )}
                </Flexbox>
              );
            })}
        </Flexbox>
      </Flexbox>
    </Flexbox>
  );
}

const useStyles = createUseStyles({
  container: {
    width: '100%',
    padding: 12,
    overflow: 'hidden',
  },
  itemsList: {
    overflowY: 'auto',
  },
  item: {
    padding: '8px 12px',
    borderRadius: 4,
    cursor: 'pointer',

    '&:hover': {
      backgroundColor: DokkimiColorsV2.blackQuaternary,
    },
  },
  itemUsage: {
    marginLeft: 24,
  },
  selectedItem: {
    backgroundColor: DokkimiColorsV2.blackQuaternary,
  },
  selectedItemText: {
    color: DokkimiColorsV2.white,
    fontWeight: 'bold',
  },
  selectedItemIcon: {
    color: DokkimiColorsV2.accentPrimary,
  },
  itemIcon: {
    height: 16,
    width: 16,

    '&:hover': {
      color: DokkimiColorsV2.accentPrimary,
    },
  },
  itemText: {
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  cpuTitle: {
    fontWeight: 'bold',
    color: DokkimiColorsV2.cpuBlue,
  },
  ramTitle: {
    fontWeight: 'bold',
    color: DokkimiColorsV2.ramOrange,
  },
});
