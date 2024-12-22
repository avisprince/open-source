import { useCallback, useRef } from 'react';

export default function useDebounce(
  callback: (...args: any) => void | Promise<void>,
  delay: number = 500,
) {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    async (...args: any) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => callback(...args), delay);
    },
    [callback, delay],
  );
}
