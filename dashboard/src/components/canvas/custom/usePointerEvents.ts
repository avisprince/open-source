import { useRecoilValue } from 'recoil';

import { canvasActionStatusAtom } from 'src/recoil/dashboard/dashboard.atoms';

export default function usePointerEvents() {
  const canvasActionStatus = useRecoilValue(canvasActionStatusAtom);

  return canvasActionStatus.has('selecting') ||
    canvasActionStatus.has('dragging') ||
    canvasActionStatus.has('scrolling')
    ? 'none'
    : 'auto';
}
