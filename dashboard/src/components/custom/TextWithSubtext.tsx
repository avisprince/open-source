import { Text } from '@fluentui/react-components';

import Flexbox from 'src/components/custom/Flexbox';
import { DokkimiColors } from 'src/components/styles/colors';

type Props = {
  text?: string | null;
  subtext?: string | null;
  align?: 'start' | 'center' | 'end';
};

export default function TextWithSubtext({
  text,
  subtext,
  align = 'start',
}: Props) {
  return (
    <Flexbox direction="column" alignItems={align}>
      {text && <Text>{text}</Text>}
      {subtext && (
        <Text size={200} style={{ color: DokkimiColors.tertiaryText }}>
          {subtext}
        </Text>
      )}
    </Flexbox>
  );
}
