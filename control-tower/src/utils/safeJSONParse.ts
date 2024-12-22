export default function safeJSONparse(val: any, defaultVal?: any): any {
  try {
    if (typeof val === 'object') {
      return JSON.parse(JSON.stringify(val));
    }

    return JSON.parse(val);
  } catch {
    return defaultVal ?? val ?? '';
  }
}
