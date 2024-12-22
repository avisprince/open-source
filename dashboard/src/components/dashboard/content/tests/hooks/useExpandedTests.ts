import { useCallback } from 'react';
import { useRecoilState } from 'recoil';

import { expandedTestsAtom } from 'src/recoil/dashboard/dashboard.atoms';
import { toggleSet } from 'src/util/util';

export default function useExpandedTests(id: string) {
  const [expandedTests, setExpandedTests] = useRecoilState(expandedTestsAtom);
  const isExpanded = expandedTests.has(id);

  const toggleTest = useCallback(
    () => setExpandedTests(curr => toggleSet(curr, id)),
    [id, setExpandedTests],
  );

  return [isExpanded, toggleTest] as const;
}
