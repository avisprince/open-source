import { Button } from '@fluentui/react-components';

import Icon from 'src/components/custom/Icon';

type Props = {
  isExpanded: boolean;
  onClick: () => void;
};

export default function RightDownChevron({ isExpanded, onClick }: Props) {
  return (
    <Button
      appearance="subtle"
      onClick={onClick}
      icon={<Icon name={isExpanded ? 'chevronDown' : 'chevronRight'} />}
    />
  );
}
