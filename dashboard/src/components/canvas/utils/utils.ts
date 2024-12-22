import $ from 'jquery';
import { KonvaEventObject } from 'konva/lib/Node';

export function setCursor(
  e: KonvaEventObject<MouseEvent>,
  cursor: string,
): void {
  const container = e.target.getStage()?.container();
  if (container) {
    container.style.cursor = cursor;
  }
}

type Rectangle = {
  x: number;
  y: number;
  height: number;
  width: number;
};

export function isOverlapping(rect1: Rectangle, rect2: Rectangle): boolean {
  // If one rectangle is on the left of the other
  if (rect1.x > rect2.x + rect2.width || rect2.x > rect1.x + rect1.width) {
    return false;
  }

  // If one rectangle is above the other
  if (rect1.y > rect2.y + rect2.height || rect2.y > rect1.y + rect1.height) {
    return false;
  }

  return true;
}

export function sendItemToTop(itemId: string) {
  const selector = $(`.${itemId}`).parent();
  const parent = selector.parent();
  parent.append(selector);
}
