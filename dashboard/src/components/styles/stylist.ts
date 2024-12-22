import { CSSProperties } from 'react';

export default function stylist(
  styles: CSSProperties | CSSProperties[],
): CSSProperties {
  if (!Array.isArray(styles)) {
    return styles;
  }

  return styles
    .filter(style => !!style)
    .reduce((stylesheet, style) => {
      return {
        ...stylesheet,
        ...style,
      };
    }, {});
}
