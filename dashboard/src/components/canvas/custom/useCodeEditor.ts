import { useCallback, useEffect, useState } from 'react';

export const prettifyValue = (value: string) => {
  try {
    return JSON.stringify(JSON.parse(value), null, '\t');
  } catch (err) {
    return value || '';
  }
};

type Props = {
  value: string;
  readOnly?: boolean;
  onChange: (val: string) => void;
};

export default function useCodeEditor({ value, readOnly, onChange }: Props) {
  const [code, setCode] = useState(value);

  useEffect(() => {
    if (readOnly) {
      setCode(prettifyValue(value));
    }
  }, [readOnly, value]);

  const onCodeChange = useCallback(
    (val: string) => {
      if (!readOnly) {
        setCode(val);
        onChange(val);
      }
    },
    [readOnly, onChange],
  );

  const onPrettify = useCallback(() => {
    const prettified = prettifyValue(code);
    setCode(prettified);
    onChange(prettified);
  }, [code, onChange]);

  return {
    code,
    onCodeChange,
    onPrettify,
  };
}
