import { Input, InputProps, makeStyles } from '@fluentui/react-components';

type Props = {
  pointerEvents: 'auto' | 'none';
} & InputProps;

const useOverrides = makeStyles({
  input: {
    display: 'grid',
  }
});

export function CanvasInput({ pointerEvents, style, ...inputProps }: Props) {
  const overrides = useOverrides();

  return (
    <Input
      {...inputProps}
      className={overrides.input}
      style={{
        ...style,
        pointerEvents,
      }}
    />
  );
}
