import { Stage } from 'konva/lib/Stage';
import { Vector2d } from 'konva/lib/types';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import usePublishCanvasData from 'src/components/canvas/hooks/usePublishCanvasData';
import useDebounce from 'src/hooks/useDebounce';
import {
  canvasActionStatusAtom,
  canvasOffsetAtom,
  canvasScaleAtom,
  mouseOffCanvasAtom,
  showSettingsMenuAtom,
} from 'src/recoil/dashboard/dashboard.atoms';
import { addToSet, deleteFromSet } from 'src/util/util';

export const SCROLL_SCALE = 1.3;
export const ZOOM_SCALE = 1.2;

export function useCanvas(stageRef: React.MutableRefObject<Stage | null>) {
  const mousePosition = useRef<Vector2d>({ x: 0, y: 0 });
  const [scrollOffset, setScrollOffset] = useRecoilState(canvasOffsetAtom);
  const [scale, setScale] = useRecoilState(canvasScaleAtom);
  const publishData = usePublishCanvasData();
  const setCanvasActionStatus = useSetRecoilState(canvasActionStatusAtom);
  const mouseOffCanvas = useRecoilValue(mouseOffCanvasAtom);
  const showSettingsMenu = useRecoilValue(showSettingsMenuAtom);
  const [showContextMenu, setShowContextMenu] = useState<string | null>(null);
  const [showCanvasContextMenu, setShowCanvasContextMenu] =
    useState<boolean>(false);

  const getMousePosition = useCallback(() => {
    const stage = stageRef.current;
    const pointer = stage?.getPointerPosition();
    if (!stage || !pointer) {
      return {
        x: 0,
        y: 0,
      };
    }

    return {
      x: (pointer.x - stage.x()) / scale + scrollOffset.x,
      y: (pointer.y - stage.y()) / scale + scrollOffset.y,
    };
  }, [scale, scrollOffset, stageRef]);

  const handleMouseMove = useCallback(() => {
    mousePosition.current = getMousePosition();

    publishData({
      type: 'mouse',
      x: mousePosition.current.x,
      y: mousePosition.current.y,
    });
  }, [publishData, getMousePosition]);

  const debouncedScrollEnd = useDebounce(() => {
    setCanvasActionStatus(curr => deleteFromSet(curr, 'scrolling'));
  }, 200);

  const onWheelStage = useCallback(
    (event: WheelEvent) => {
      if (
        showCanvasContextMenu ||
        showContextMenu ||
        showSettingsMenu ||
        mouseOffCanvas
      ) {
        return;
      }

      setCanvasActionStatus(curr => addToSet(curr, 'scrolling'));

      if (event.metaKey || event.ctrlKey) {
        event.preventDefault();

        const stage = stageRef.current;
        const pointer = stage?.getPointerPosition();
        if (!stage || !pointer) {
          return;
        }

        const mousePointTo = {
          x: (pointer.x - stage.x()) / scale,
          y: (pointer.y - stage.y()) / scale,
        };

        const direction = event.deltaY > 0 ? -1 : 1;
        const newScale =
          direction > 0 ? scale * ZOOM_SCALE : scale / ZOOM_SCALE;
        setScale(newScale);

        stage.position({
          x: pointer.x - mousePointTo.x * newScale,
          y: pointer.y - mousePointTo.y * newScale,
        });
      } else {
        event.preventDefault();
        setScrollOffset(curr => ({
          x: curr.x + event.deltaX / scale,
          y: curr.y + event.deltaY / scale,
        }));
      }

      debouncedScrollEnd();
    },
    [
      debouncedScrollEnd,
      setCanvasActionStatus,
      setScale,
      setScrollOffset,
      stageRef,
      scale,
      showSettingsMenu,
      showContextMenu,
      showCanvasContextMenu,
      mouseOffCanvas,
    ],
  );

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('wheel', onWheelStage, { passive: false });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('wheel', onWheelStage);
    };
  }, [handleMouseMove, onWheelStage]);

  return {
    stageRef,
    mousePosition,
    getMousePosition,
    scrollOffset,
    setScrollOffset,
    showContextMenu,
    setShowContextMenu,
    showCanvasContextMenu,
    setShowCanvasContextMenu,
  };
}
