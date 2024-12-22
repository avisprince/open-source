import { useCallback, useEffect, useRef } from 'react';

export default function useInterval(
  callback: () => void,
  delay: number,
  isActive: boolean = true,
) {
  const interval = useRef<NodeJS.Timer | undefined>(undefined);

  const clear = useCallback(() => {
    if (interval.current) {
      clearInterval(interval.current);
    }
  }, [interval]);

  useEffect(() => {
    clear();

    if (isActive) {
      interval.current = setInterval(callback, delay);
    }

    return () => {
      clear();
    };
  }, [isActive, interval, delay]);
}
