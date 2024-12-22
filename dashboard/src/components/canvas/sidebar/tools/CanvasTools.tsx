import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { useSetRecoilState } from 'recoil';

import { CanvasItemType } from 'src/components/canvas/Canvas';
import { CanvasItemIcons } from 'src/components/canvas/utils/canvasItemDefaults';
import DokkimiTooltip from 'src/components/custom/DokkimiTooltip';
import Flexbox from 'src/components/custom/Flexbox';
import { DokkimiColors, DokkimiColorsV2 } from 'src/components/styles/colors';
import stylist from 'src/components/styles/stylist';
import { newCanvasItemDragTypeAtom } from 'src/recoil/dashboard/dashboard.atoms';
import { Stylesheet } from 'src/types/Stylesheet';

type CanvasTool = {
  icon: IconDefinition;
  canvasItemType: CanvasItemType;
  tooltip: string;
};

export const canvasTools: CanvasTool[] = [
  {
    icon: CanvasItemIcons['Service'],
    canvasItemType: 'Service',
    tooltip: 'New Service',
  },
  {
    icon: CanvasItemIcons['Database'],
    canvasItemType: 'Database',
    tooltip: 'New Database',
  },
  {
    icon: CanvasItemIcons['HttpRequest'],
    canvasItemType: 'HttpRequest',
    tooltip: 'New HTTP Request',
  },
  {
    icon: CanvasItemIcons['MockEndpoint'],
    canvasItemType: 'MockEndpoint',
    tooltip: 'New Mock Endpoint',
  },
  {
    icon: CanvasItemIcons['DbQuery'],
    canvasItemType: 'DbQuery',
    tooltip: 'New Database Query',
  },
];

export default function CanvasTools() {
  const [hoveredItem, setHoveredItem] = useState<CanvasItemType | null>(null);
  const setDragType = useSetRecoilState(newCanvasItemDragTypeAtom);

  return (
    <Flexbox
      alignItems="center"
      justifyContent="space-evenly"
      style={styles.container}
    >
      {canvasTools.map(({ icon, canvasItemType, tooltip }, index) => (
        <DokkimiTooltip
          key={index}
          content={tooltip}
          positioning="below"
          relationship="label"
        >
          <Flexbox
            alignItems="center"
            justifyContent="center"
            onMouseEnter={() => setHoveredItem(canvasItemType)}
            onMouseLeave={() => setHoveredItem(null)}
            draggable
            style={stylist([
              styles.tool,
              hoveredItem === canvasItemType ? styles.hoveredTool : {},
            ])}
            onDragStart={() =>
              setDragType({
                type: canvasItemType,
              })
            }
          >
            <FontAwesomeIcon icon={icon} size="lg" />
          </Flexbox>
        </DokkimiTooltip>
      ))}
    </Flexbox>
  );
}

const styles = {
  container: {
    padding: 4,
    borderRadius: 4,
  },
  hoveredTool: {
    backgroundColor: DokkimiColors.secondaryBackgroundColor,
    color: DokkimiColorsV2.accentPrimary,
  },
  title: {
    padding: '0 8px',
  },
  tool: {
    height: 44,
    width: 44,
    minWidth: 44,
    padding: 8,
    borderRadius: 4,
    cursor: 'pointer',
    color: DokkimiColorsV2.offWhite,
  },
} satisfies Stylesheet;
