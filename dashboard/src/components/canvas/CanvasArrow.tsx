import { useMemo } from 'react';
import { Arrow, Group } from 'react-konva';
import { graphql, useFragment } from 'react-relay';

import useCanvasItemDimensions from 'src/components/canvas/hooks/useCanvasItemDimensions';
import { DokkimiColors } from 'src/components/styles/colors';

import { CanvasArrow_namespaceItem$key } from './__generated__/CanvasArrow_namespaceItem.graphql';

type Props = {
  node1Ref: CanvasArrow_namespaceItem$key;
  node2Ref: CanvasArrow_namespaceItem$key;
  isSelected?: boolean;
  onClick?: () => void;
};

export default function CanvasArrow({
  node1Ref,
  node2Ref,
  isSelected,
  onClick,
}: Props) {
  const canvasArrowFragment = graphql`
    fragment CanvasArrow_namespaceItem on NamespaceItem {
      canvasInfo {
        posX
        posY
      }
      ...useCanvasItemDimensions_namespaceItem
    }
  `;

  const node1 = useFragment(canvasArrowFragment, node1Ref);
  const node2 = useFragment(canvasArrowFragment, node2Ref);

  const { height: height1, width: width1 } = useCanvasItemDimensions(node1);
  const { height: height2, width: width2 } = useCanvasItemDimensions(node2);

  const { posX: node1X, posY: node1Y } = node1.canvasInfo;
  const { posX: node2X, posY: node2Y } = node2.canvasInfo;

  const sideArrows = useMemo(
    () =>
      Math.abs(node1Y - node2Y) < height1 + height2 &&
      Math.abs(node1X - node2X) > width1,
    [node1X, node1Y, node2X, node2Y, height1, height2, width1],
  );

  const [arrowStart, arrowEnd] = useMemo(() => {
    if (sideArrows) {
      return [
        {
          x: node1X < node2X ? node1X + width1 : node1X,
          y: node1Y + height1 / 2,
        },
        {
          x: node1X < node2X ? node2X : node2X + width2,
          y: node2Y + height2 / 2,
        },
      ];
    }

    return [
      {
        x: node1X + width1 / 2,
        y: node1Y < node2Y ? node1Y + height1 : node1Y,
      },
      {
        x: node2X + width2 / 2,
        y: node1Y < node2Y ? node2Y : node2Y + height2,
      },
    ];
  }, [
    node1X,
    node1Y,
    node2X,
    node2Y,
    sideArrows,
    height1,
    height2,
    width1,
    width2,
  ]);

  const color = isSelected ? DokkimiColors.accentBackgroundColor : 'white';
  const middlePoints = sideArrows
    ? [arrowEnd.x, arrowStart.y, arrowStart.x, arrowEnd.y]
    : [arrowStart.x, arrowEnd.y, arrowEnd.x, arrowStart.y];

  return (
    <Group>
      <Arrow
        points={[
          arrowStart.x,
          arrowStart.y,
          ...middlePoints,
          arrowEnd.x,
          arrowEnd.y,
        ]}
        bezier
        fill={color}
        stroke={color}
        strokeWidth={1.5}
        pointerWidth={10}
        onClick={() => {
          onClick && onClick();
        }}
      />
    </Group>
  );
}
