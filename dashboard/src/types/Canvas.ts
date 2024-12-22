export type CanvasActionStatus =
  | 'selecting'
  | 'dragging'
  | 'scrolling'
  | 'hovering'
  | 'panning'
  | 'none';

export interface Vector2d {
  x: number;
  y: number;
}

export const itemStatuses = ['crashed', 'loading', 'running'] as const;
export type ItemStatuses = (typeof itemStatuses)[number];
export function isItemStatus(status: string): status is ItemStatuses {
  return ['crashed', 'loading', 'running'].includes(status);
}
