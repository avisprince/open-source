import { useMemo } from 'react';

export default function useParsedFilename(filename: string) {
  return useMemo(() => {
    const split = filename.split('.');
    const ext = split.pop() ?? '';
    return [split.join('.'), ext] as const;
  }, [filename]);
}
