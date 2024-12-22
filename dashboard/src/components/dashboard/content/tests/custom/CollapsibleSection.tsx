import { Button } from '@fluentui/react-components';
import { ChevronDownRegular, ChevronUpRegular } from '@fluentui/react-icons';
import { ReactNode, useState } from 'react';

import Flexbox from 'src/components/custom/Flexbox';
import TextWithSubtext from 'src/components/custom/TextWithSubtext';
import { DokkimiColors } from 'src/components/styles/colors';
import { Stylesheet } from 'src/types/Stylesheet';

type Props = {
  headerIcon: ReactNode;
  headerText: string;
  headerSubtext?: string;
  headerActions?: ReactNode;
  children: ReactNode;
  expanded?: boolean;
};

export default function CollapsibleSection({
  headerIcon,
  headerText,
  headerSubtext,
  headerActions,
  children,
  expanded = true,
}: Props) {
  const [isExpanded, setIsExpanded] = useState<boolean>(expanded);

  return (
    <div style={styles.container}>
      <Flexbox
        alignItems="center"
        justifyContent="space-between"
        style={styles.header}
      >
        <Flexbox gap={16} alignItems="center">
          {headerIcon}
          <TextWithSubtext text={headerText} subtext={headerSubtext} />
        </Flexbox>
        <Flexbox gap={8} alignItems="center">
          {headerActions}
          <Button
            appearance="subtle"
            icon={isExpanded ? <ChevronUpRegular /> : <ChevronDownRegular />}
            onClick={() => setIsExpanded(curr => !curr)}
          />
        </Flexbox>
      </Flexbox>
      {isExpanded && <div style={styles.body}>{children}</div>}
    </div>
  );
}

const styles: Stylesheet = {
  container: {
    borderRadius: 4,
    backgroundColor: DokkimiColors.secondaryBackgroundColor,
  },
  header: {
    padding: '12px 8px 12px 16px',
  },
  body: {
    padding: '8px 12px',
    backgroundColor: DokkimiColors.blackBackgroundColor,
  },
};
