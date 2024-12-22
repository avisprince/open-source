import { Divider } from '@fluentui/react-components';
import { ReactNode } from 'react';

import Flexbox from 'src/components/custom/Flexbox';
import { DokkimiColorsV2 } from 'src/components/styles/colors';
import { Stylesheet } from 'src/types/Stylesheet';

type Props = {
  title: string;
  endContent?: ReactNode;
  children: ReactNode;
};

export default function ContentLayout({ title, children, endContent }: Props) {
  return (
    <div style={styles.container}>
      <Flexbox direction="column" style={styles.innerContainer} gap={24}>
        <Flexbox alignItems="center" gap={16}>
          <Divider alignContent="start" style={styles.divider}>
            {title}
          </Divider>
          {endContent}
        </Flexbox>
        {children}
      </Flexbox>
    </div>
  );
}

const styles = {
  container: {
    height: '100%',
    padding: 24,
    overflow: 'hidden',
    backgroundColor: DokkimiColorsV2.blackTertiary,
  },
  innerContainer: {
    maxHeight: '100%',
    padding: 16,
    borderRadius: 4,
    backgroundColor: DokkimiColorsV2.blackSecondary,
    overflow: 'hidden',
  },
  divider: {
    flexGrow: 0,
    fontSize: 20,
  },
} satisfies Stylesheet;
