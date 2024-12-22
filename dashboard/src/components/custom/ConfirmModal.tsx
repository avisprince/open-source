import { Button } from '@fluentui/react-components';
import { Info20Filled } from '@fluentui/react-icons';
import { ReactNode } from 'react';

import DokkimiModal from 'src/components/custom/DokkimiModal';
import Flexbox from 'src/components/custom/Flexbox';
import Icon from 'src/components/custom/Icon';
import { DokkimiColorsV2 } from 'src/components/styles/colors';
import { Stylesheet } from 'src/types/Stylesheet';

type Props = {
  isOpen: boolean;
  toggle: () => void;
  title: ReactNode | string;
  subtitle?: ReactNode | string;
  buttonText: string;
  onConfirm: () => void;
};

export default function ConfirmModal({
  isOpen,
  toggle,
  title,
  subtitle,
  buttonText,
  onConfirm,
}: Props) {
  return (
    <DokkimiModal isOpen={isOpen} toggle={toggle} width={600}>
      <Flexbox
        alignItems="center"
        justifyContent="space-between"
        style={styles.modalHeader}
      >
        <Flexbox alignItems="center" gap={12}>
          <Info20Filled color={DokkimiColorsV2.accentPrimary} />
          <Flexbox alignItems="center" style={styles.title}>
            {title}
          </Flexbox>
        </Flexbox>
        <Button
          appearance="subtle"
          icon={<Icon name="close" />}
          onClick={toggle}
        />
      </Flexbox>
      <div style={styles.modalContent}>
        <Flexbox alignItems="center">{subtitle}</Flexbox>
        <Button
          appearance="primary"
          style={styles.confirmButton}
          onClick={() => {
            onConfirm();
            toggle();
          }}
        >
          {buttonText}
        </Button>
      </div>
    </DokkimiModal>
  );
}

const styles = {
  confirmButton: {
    marginTop: 16,
  },
  modalHeader: {
    padding: 12,
    paddingLeft: 16,
  },
  modalContent: {
    marginTop: -16,
    padding: '0 0 16px 48px',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
} satisfies Stylesheet;
