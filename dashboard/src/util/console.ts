import echomd from 'src/util/echomd';

const methods = [
  'debug',
  'error',
  'group',
  'groupCollapsed',
  'info',
  'log',
  'trace',
  'warn',
] as const;
type Methods = (typeof methods)[number];

export const release = (
  strings: TemplateStringsArray,
  ...values: unknown[]
) => {
  if (
    values.some(
      value =>
        value === undefined ||
        value === null ||
        (Array.isArray(value) && !value.length) ||
        (typeof value === 'object' && !Object.keys(value).length),
    )
  ) {
    return undefined;
  }

  return strings.reduce((acc, str, i) => {
    const value = values[i - 1];
    if (typeof value === 'undefined') {
      return acc + str;
    } else {
      return acc + value + str;
    }
  });
};

export const dconsole = (delimiter?: string) => methods.reduce((acc, key) => {
  acc[key] = (...data: unknown[]) =>
    console[key](echomd(data.filter(Boolean).join(delimiter) || delimiter));
  return acc;
}, {} as Record<Methods, (...data: unknown[]) => void>);
