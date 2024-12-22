import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { Vector2d } from 'konva/lib/types';
import { Dictionary } from 'lodash';
import { atom } from 'recoil';

import { CanvasItemType } from 'src/components/canvas/Canvas';
import { ActionIdentifier } from 'src/components/canvas/sidebar/shared/types';

export const currentTabAtom = atom<string | null>({
  key: 'currentTabAtom',
  default: 'overview',
});

export interface Session {
  namespaceId: string;
  orgId: string;
  sessionId: string;
}

export const sessionAtom = atom<Session>({
  key: 'sessionAtom',
  default: {
    namespaceId: '',
    orgId: '',
    sessionId: '',
  },
});

export const canvasOffsetAtom = atom<Vector2d>({
  key: 'canvasOffsetAtom',
  default: { x: 0, y: 0 },
});

export const canvasScaleAtom = atom<number>({
  key: 'canvasScaleAtom',
  default: 0.75,
});

export const selectedCanvasItemsAtom = atom<Set<string>>({
  key: 'selectedCanvasItemsAtom',
  default: new Set(),
});

export const hoveredCanvasItemAtom = atom<string | null>({
  key: 'hoveredCanvasItemsAtom',
  default: null,
});

export type CanvasActionStatus =
  | 'selecting'
  | 'dragging'
  | 'scrolling'
  | 'hovering';

export const canvasActionStatusAtom = atom<Set<CanvasActionStatus>>({
  key: 'canvasActionStatus',
  default: new Set(),
});

export const newCanvasItemDragTypeAtom = atom<{
  type: CanvasItemType;
  templateId?: string | null;
} | null>({
  key: 'newCanvasItemDragTypeAtom',
  default: null,
});

export const focusedCanvasItemAtom = atom<string | null>({
  key: 'focusedCanvasItemAtom',
  default: null,
});

export const hoveredNamespaceActionAtom = atom<string | null>({
  key: 'hoveredNamespaceActionAtom',
  default: null,
});

export const selectedNamespaceActionAtom = atom<ActionIdentifier | null>({
  key: 'selectedNamespaceActionAtom',
  default: null,
});

export const selectedNamespaceQueryAtom = atom<string | null>({
  key: 'selectedNamespaceQueryAtom',
  default: null,
});

export const hoveringContextMenuAtom = atom<boolean>({
  key: 'hoveringContextMenuAtom',
  default: false,
});

export const showSettingsMenuAtom = atom<boolean>({
  key: 'showSettingsMenuAtom',
  default: false,
});

export const mouseOffCanvasAtom = atom<boolean>({
  key: 'mouseOffCanvasAtom',
  default: false,
});

export const activeUserMousePositionsAtom = atom<
  Dictionary<{ x: number; y: number }>
>({
  key: 'activeUserMousePositionsAtom',
  default: {},
});

export const expandedTestsAtom = atom<Set<string>>({
  key: 'expandedTestsAtom',
  default: new Set(),
});

export const selectedCanvasSidebarTabAtom = atom<{
  id: string;
  icon: IconDefinition;
} | null>({
  key: 'selectedCanvasSidebarTabAtom',
  default: null,
});

export const collapsedHistorySectionsAtom = atom<Set<string>>({
  key: 'collapsedHistorySectionsAtom',
  default: new Set(),
});

export const canvasItemDimensionsAtom = atom<
  Dictionary<{ height: number; width: number }>
>({
  key: 'canvasDimensionsAtom',
  default: {},
});
