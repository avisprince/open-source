import { useCallback } from 'react';
import { useRecoilValue } from 'recoil';

import { CanvasItemType } from 'src/components/canvas/Canvas';
import { getCanvasItemDefaults } from 'src/components/canvas/utils/canvasItemDefaults';
import { canvasItemDimensionsAtom } from 'src/recoil/dashboard/dashboard.atoms';

export default function useGetCanvasItemDimensions() {
  const dimensions = useRecoilValue(canvasItemDimensionsAtom);

  return useCallback(
    (itemId: string, itemType: string) => {
      const itemDimensions = dimensions[itemId] ?? { height: 0, width: 0 };
      const defaultDimensions = getCanvasItemDefaults(
        itemType as CanvasItemType,
      );

      return {
        height: Math.max(itemDimensions.height, defaultDimensions.height),
        width: Math.max(itemDimensions.width, defaultDimensions.width),
      };
    },
    [dimensions],
  );
}
