import dayjs from 'dayjs';
import { useEffect, useRef, useState } from 'react';

interface Updatable {
  updatedAt?: Date;
}

export default function useAutoSaveForm<T extends Updatable>(
  data: T,
  onUpdate: (data: T) => void,
) {
  const isUserUpdate = useRef<boolean>(false);
  const [fields, setFields] = useState<T>({
    ...data,
    updatedAt: data.updatedAt ?? new Date(),
  });

  const handleFieldChange = (name: string, value: T[keyof T]) => {
    isUserUpdate.current = true;
    setFields(curr => ({
      ...curr,
      [name]: value,
    }));
  };

  useEffect(() => {
    const handleUpdate = () => {
      if (isUserUpdate.current) {
        onUpdate({
          ...fields,
          updatedAt: new Date(),
        });
        isUserUpdate.current = false;
      }
    };

    handleUpdate();
  }, [fields, onUpdate, data]);

  useEffect(() => {
    if (
      !isUserUpdate.current &&
      dayjs(data.updatedAt).isAfter(dayjs(fields.updatedAt))
    ) {
      setFields({
        ...data,
        updatedAt: data.updatedAt ?? new Date(),
      });
    }
  }, [data, fields.updatedAt]);

  return [fields, handleFieldChange] as const;
}
