import { Select, SelectProps } from '@fluentui/react-components';

type Props = {
  pointerEvents: 'auto' | 'none';
} & SelectProps;

export function CanvasSelect({ pointerEvents, style, ...selectProps }: Props) {
  return (
    <Select
      {...selectProps}
      style={{
        ...style,
        pointerEvents,
      }}
    />
  );
}
