import { DivProps } from 'react-html-props';

type Props = {
  direction?: 'row' | 'column';
  alignItems?: 'start' | 'center' | 'end';
  justifyContent?:
    | 'start'
    | 'center'
    | 'end'
    | 'space-between'
    | 'space-evenly';
  justifySelf?: 'start' | 'end';
  grow?: number;
  shrink?: number;
  gap?: number;
  wrap?: 'wrap' | 'nowrap' | 'wrap-reverse';
  fullWidth?: boolean;
  fullHeight?: boolean;
} & DivProps;

export default function Flexbox({
  children,
  direction = 'row',
  alignItems,
  justifyContent,
  justifySelf,
  grow,
  shrink,
  wrap = 'nowrap',
  gap,
  style = {},
  fullWidth,
  fullHeight,
  ...props
}: Props) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: direction,
        alignItems,
        justifySelf,
        justifyContent,
        flexGrow: grow,
        flexShrink: shrink,
        flexWrap: wrap,
        gap,
        width: fullWidth ? '100%' : undefined,
        height: fullHeight ? '100%' : undefined,

        // Keep last
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
