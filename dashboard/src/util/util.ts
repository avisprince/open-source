export function emptyFunction(): void {}

export function toggleSet<T>(set: Set<T>, key: T): Set<T> {
  const copy = new Set(set);
  copy.has(key) ? copy.delete(key) : copy.add(key);
  return copy;
}

export function addToSet<T>(set: Set<T>, key: T): Set<T> {
  const copy = new Set(set);
  copy.add(key);
  return copy;
}

export function deleteFromSet<T>(set: Set<T>, key: T): Set<T> {
  const copy = new Set(set);
  copy.delete(key);
  return copy;
}

export function safeJSONparse(val: any, defaultVal?: any): any {
  try {
    if (typeof val === 'object') {
      return JSON.parse(JSON.stringify(val));
    }

    return JSON.parse(val);
  } catch {
    return defaultVal ?? val ?? '';
  }
}

export function isValidJSON(jsonString: string): boolean {
  try {
    JSON.parse(jsonString);
    return true;
  } catch (e) {
    return false;
  }
}
