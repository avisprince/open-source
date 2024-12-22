import { Group, Rect } from 'react-konva';
import { Html } from 'react-konva-utils';
import { useRecoilValue } from 'recoil';

import { DokkimiColors } from 'src/components/styles/colors';
import { canvasScaleAtom } from 'src/recoil/dashboard/dashboard.atoms';

type Props = {
  x: number;
  y: number;
  height: number;
  width: number;
  visible: boolean;
};

export default function CanvasSelectRectangle({
  x,
  y,
  height,
  width,
  visible,
}: Props) {
  const scale = useRecoilValue(canvasScaleAtom);

  return (
    <Group x={x} y={y} visible={visible} scaleX={1 / scale} scaleY={1 / scale}>
      <Rect height={height} width={width} />
      <Html
        divProps={{
          style: {
            pointerEvents: 'none',
            zIndex: 9999,
          },
        }}
      >
        <div
          style={{
            height: height * scale,
            width: width * scale,
            backgroundColor: DokkimiColors.accentBackgroundColorOpaque,
            borderColor: DokkimiColors.accentBackgroundColor,
            borderStyle: 'solid',
            borderWidth: 2,
            visibility: visible ? 'visible' : 'hidden',
          }}
        />
      </Html>
    </Group>
  );
}
