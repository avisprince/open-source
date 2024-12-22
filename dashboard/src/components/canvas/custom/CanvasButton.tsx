import { Button, ButtonProps } from '@fluentui/react-components';

type Props = {
  pointerEvents: 'auto' | 'none';
} & ButtonProps;

export function CanvasButton({ pointerEvents, style, ...buttonProps }: Props) {
  return (
    <Button
      {...buttonProps}
      style={{
        ...style,
        pointerEvents,
      }}
    />
  );
}
