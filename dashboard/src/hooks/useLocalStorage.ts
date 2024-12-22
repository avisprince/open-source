export type StorageItemKey = '';

export function useLocalStorage() {
  const setItem = (key: StorageItemKey, value: string) => {
    localStorage.setItem(key, value);
  };

  const getItem = (key: StorageItemKey) => {
    return localStorage.getItem(key);
  };

  const removeItem = (key: StorageItemKey) => {
    localStorage.removeItem(key);
  };

  return {
    getItem,
    setItem,
    removeItem,
  };
}
