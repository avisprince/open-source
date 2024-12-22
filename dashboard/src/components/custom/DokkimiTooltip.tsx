import { Tooltip, TooltipProps } from '@fluentui/react-components';
import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
} & TooltipProps;

export default function DokkimiTooltip({ children, ...props }: Props) {
  return (
    <div>
      <Tooltip {...props}>
        <div>{children}</div>
      </Tooltip>
    </div>
  );
}
