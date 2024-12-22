import { getBoxToBoxArrow } from 'curved-arrows';

import { DokkimiColorsV2 } from 'src/components/styles/colors';

type Props = {
  p1: { x: number; y: number; width?: number; height?: number };
  p2: { x: number; y: number; width?: number; height?: number };
  boxWidth?: number;
  boxHeight?: number;
  arrowHeadSize?: number;
  color?: string;
};

export default function SandboxCardPreviewArrow({
  p1,
  p2,
  boxWidth,
  boxHeight,
  arrowHeadSize = 4,
  color = DokkimiColorsV2.accentPrimary,
}: Props) {
  const [sx, sy, c1x, c1y, c2x, c2y, ex, ey, ae] = getBoxToBoxArrow(
    p1.x,
    p1.y,
    p1.width || 0,
    p1.height || 0,
    p2.x,
    p2.y,
    p2.width || 0,
    p2.height || 0,
    {
      padEnd: arrowHeadSize,
    },
  );

  return (
    <svg
      style={{
        position: 'absolute',
        width: boxWidth,
        height: boxHeight,
      }}
      width="100%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d={`M ${sx + 2} ${sy} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${ex} ${ey}`}
        stroke={color}
        strokeWidth={arrowHeadSize / 2}
        fill="none"
      />
      <polygon
        points={`0,${-arrowHeadSize} ${
          arrowHeadSize * 2
        },0, 0,${arrowHeadSize}`}
        transform={`translate(${ex}, ${ey}) rotate(${ae})`}
        fill={color}
      />
    </svg>
  );
}
