import { Cursor24Filled } from '@fluentui/react-icons';
import { Group, Rect } from 'react-konva';
import { Html } from 'react-konva-utils';
import { useRecoilValue } from 'recoil';

import stylist from 'src/components/styles/stylist';
import { canvasScaleAtom } from 'src/recoil/dashboard/dashboard.atoms';
import { Stylesheet } from 'src/types/Stylesheet';

type Props = {
  displayName: string;
  color: string;
  x: number;
  y: number;
};

export default function CanvasPointer({ displayName, color, x, y }: Props) {
  const scale = useRecoilValue(canvasScaleAtom);

  return (
    <Group x={x} y={y} scaleX={1 / scale} scaleY={1 / scale}>
      <Rect x={0} y={0} />
      <Html divProps={{ style: { pointerEvents: 'none', zIndex: 1000 } }}>
        <div>
          <Cursor24Filled color={color} />
          <div
            style={stylist([styles.pointerName, { backgroundColor: color }])}
          >
            {displayName}
          </div>
        </div>
      </Html>
    </Group>
  );
}

const styles: Stylesheet = {
  pointerName: {
    marginLeft: 16,
    marginTop: 4,
    borderRadius: 4,
    padding: '2px 6px',
  },
};
