import { Button, Dropdown, Input, Option } from '@fluentui/react-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';

import DokkimiModal from 'src/components/custom/DokkimiModal';
import Flexbox from 'src/components/custom/Flexbox';
import useCreateTemplate from 'src/components/dashboard/content/templates/hooks/useCreateTemplate';
import {
  TemplateIcons,
  TemplateType,
} from 'src/components/dashboard/content/templates/templateTypes';
import { Stylesheet } from 'src/types/Stylesheet';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function NewTemplateModal({ isOpen, onClose }: Props) {
  const [selectedValue, setSelectedValue] = useState<TemplateType>('Service');
  const [displayName, setDisplayName] = useState('');
  const [createTemplate] = useCreateTemplate();

  const onModalClose = () => {
    setSelectedValue('Service');
    setDisplayName('');
    onClose();
  };

  const onCreate = () => {
    createTemplate(selectedValue, displayName);
    onModalClose();
  };

  return (
    <DokkimiModal showCloseButton toggle={onClose} isOpen={isOpen} width={600}>
      <Flexbox
        alignItems="center"
        justifyContent="center"
        direction="column"
        gap={16}
        style={styles.modalContent}
      >
        <div>Create New Template</div>
        <Flexbox direction="column" style={styles.content} gap={16}>
          <Dropdown
            value={
              (
                <Flexbox alignItems="center" gap={8}>
                  <FontAwesomeIcon
                    icon={TemplateIcons[selectedValue]}
                    fontSize={16}
                  />
                  <div>{`${selectedValue} Template`}</div>
                </Flexbox> // eslint-disable-next-line
              ) as any
            }
          >
            {Object.entries(TemplateIcons).map(([templateType, icon]) => {
              return (
                <Option
                  key={templateType}
                  text={templateType}
                  onClick={() => setSelectedValue(templateType as TemplateType)}
                >
                  <Flexbox alignItems="center" gap={8}>
                    <FontAwesomeIcon icon={icon} fontSize={16} />
                    <div>{`${templateType} Template`}</div>
                  </Flexbox>
                </Option>
              );
            })}
          </Dropdown>
          <Input
            placeholder="Display Name"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            style={styles.input}
          />
        </Flexbox>
        <Button appearance="primary" disabled={!displayName} onClick={onCreate}>
          Create
        </Button>
      </Flexbox>
    </DokkimiModal>
  );
}

const styles = {
  content: {
    width: '50%',
  },
  input: {
    width: '100%',
  },
  modalContent: {
    padding: '64px 0 120px',
  },
} satisfies Stylesheet;
