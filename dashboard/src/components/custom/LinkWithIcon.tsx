import { Button } from '@fluentui/react-components';
import { Link } from 'react-router-dom';

import Flexbox from 'src/components/custom/Flexbox';
import Icon from 'src/components/custom/Icon';

type Props = {
  to: string;
  text: string;
};

export default function LinkWithIcon({ to, text }: Props) {
  return (
    <Flexbox gap={8} alignItems="center">
      <Link to={to} target="_blank">
        {text}
      </Link>
      <Button appearance="subtle" icon={<Icon name="link" />} />
    </Flexbox>
  );
}
