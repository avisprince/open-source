import { useCallback, useState } from 'react';

export default function useToggleState(initialState: boolean) {
  const [isActive, setIsActive] = useState(initialState);

  const toggle = useCallback(() => {
    setIsActive(curr => !curr);
  }, [setIsActive]);

  return [isActive, toggle] as const;
}
