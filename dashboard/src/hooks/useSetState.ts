import { useCallback, useState } from 'react';

import { toggleSet } from 'src/util/util';

export default function useSetState<T>(initialState?: Set<T>) {
  const [state, setState] = useState(initialState ?? new Set<T>());

  const updateState = useCallback((val: T) => {
    setState(curr => toggleSet(curr, val));
  }, []);

  return [state, updateState] as const;
}
