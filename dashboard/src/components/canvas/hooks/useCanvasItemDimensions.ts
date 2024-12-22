import { useEffect, useRef } from 'react';
import { graphql, useFragment } from 'react-relay';
import { useSetRecoilState } from 'recoil';

import useGetCanvasItemDimensions from 'src/components/canvas/hooks/useGetCanvasItemDimensions';
import { canvasItemDimensionsAtom } from 'src/recoil/dashboard/dashboard.atoms';

import { useCanvasItemDimensions_namespaceItem$key } from './__generated__/useCanvasItemDimensions_namespaceItem.graphql';

export default function useCanvasItemDimensions(
  namespaceItemRef: useCanvasItemDimensions_namespaceItem$key,
) {
  const { itemId, itemType } = useFragment(
    graphql`
      fragment useCanvasItemDimensions_namespaceItem on NamespaceItem {
        itemId
        itemType
      }
    `,
    namespaceItemRef,
  );

  const setDimensions = useSetRecoilState(canvasItemDimensionsAtom);
  const componentRef = useRef<HTMLDivElement>(null);
  const getCanvasItemDimensions = useGetCanvasItemDimensions();
  const { height, width } = getCanvasItemDimensions(itemId, itemType);

  useEffect(() => {
    if (componentRef.current) {
      const updateDimensions = (entries: ResizeObserverEntry[]) => {
        for (const { contentRect } of entries) {
          setDimensions(curr => ({
            ...curr,
            [itemId]: {
              height: contentRect.height,
              width: contentRect.width,
            },
          }));
        }
      };

      const resizeObserver = new ResizeObserver(updateDimensions);
      resizeObserver.observe(componentRef.current);

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [itemId, setDimensions, componentRef.current]); // eslint-disable-line

  return {
    height,
    width,
    componentRef,
  };
}
