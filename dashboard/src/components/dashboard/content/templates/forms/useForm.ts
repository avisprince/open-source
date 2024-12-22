import { useState } from 'react';

export default function useForm<T>(data: T) {
  const [fields, setFields] = useState<T>({
    ...data,
  });

  const handleFieldChange = (name: string, value: T[keyof T]) => {
    setFields(curr => ({
      ...curr,
      [name]: value,
    }));
  };

  return [fields, handleFieldChange] as const;
}
