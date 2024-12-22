import { Button, Divider, FluentProvider } from '@fluentui/react-components';
import { ReactNode } from 'react';
import { Modal, ModalBody } from 'reactstrap';

import reactstrapModalCSS from 'src/assets/reactstrap-modal.module.css';
import { dokkimiTheme } from 'src/theme';
import { Stylesheet } from 'src/types/Stylesheet';

import Flexbox from './Flexbox';
import Icon from './Icon';

type Props = {
  children: ReactNode;
  isOpen?: boolean;
  toggle?: () => void;
  title?: ReactNode;
  showHeaderDivider?: boolean;
  width?: number | string;
  height?: number | string;
  showCloseButton?: boolean;
};

export default function DokkimiModal({
  children,
  isOpen,
  toggle,
  title,
  showCloseButton,
  showHeaderDivider,
  width = '80%',
  height = 'auto',
}: Props) {
  return (
    <Modal
      cssModule={reactstrapModalCSS}
      isOpen={isOpen}
      toggle={toggle}
      centered
      style={{ width, maxWidth: width, height }}
    >
      <ModalBody style={styles.modalBody}>
        <FluentProvider theme={dokkimiTheme}>
          <Flexbox alignItems="center" fullWidth justifyContent="space-between">
            {title ? (
              <Flexbox
                alignItems="center"
                justifyContent="start"
                style={styles.title}
              >
                {title}
              </Flexbox>
            ) : (
              <div />
            )}
            {showCloseButton && (
              <Flexbox
                alignItems="center"
                justifyContent="end"
                style={styles.modalHeader}
              >
                <Button
                  appearance="subtle"
                  icon={<Icon name="close" />}
                  onClick={toggle}
                />
              </Flexbox>
            )}
          </Flexbox>
          {showHeaderDivider && <Divider />}
          {children}
        </FluentProvider>
      </ModalBody>
    </Modal>
  );
}

const styles = {
  modalHeader: {
    padding: 12,
  },
  modalBody: {
    width: '100%',
    color: 'white',
    padding: 0,
    borderRadius: 8,
    overflow: 'hidden',
  },
  title: {
    padding: 16,
  },
} satisfies Stylesheet;
