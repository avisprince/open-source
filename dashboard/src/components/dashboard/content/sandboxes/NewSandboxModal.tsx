import { Button, Input } from '@fluentui/react-components';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import useCreateNamespace from 'src/components/canvas/relay/useCreateNamespace';
import DokkimiModal from 'src/components/custom/DokkimiModal';
import Flexbox from 'src/components/custom/Flexbox';
import { Stylesheet } from 'src/types/Stylesheet';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function NewSandboxModal({ isOpen, onClose }: Props) {
  const [newNamespaceName, setNewNamespaceName] = useState('');
  const [createNamespace] = useCreateNamespace();
  const navigate = useNavigate();

  const navigateToNamespace = (namespaceId: string) => {
    navigate(`/sandboxes/${namespaceId}`);
  };

  const onModalClose = () => {
    setNewNamespaceName('');
    onClose();
  };

  const onCreate = () => {
    createNamespace(newNamespaceName, navigateToNamespace);
    onModalClose();
  };

  return (
    <DokkimiModal
      isOpen={isOpen}
      toggle={onModalClose}
      width={600}
      showCloseButton={true}
    >
      <Flexbox
        gap={16}
        direction="column"
        alignItems="center"
        justifyContent="center"
        style={styles.modalContent}
      >
        <div>Create New Sandbox</div>
        <Input
          placeholder="Enter sandbox name"
          value={newNamespaceName}
          onChange={e => setNewNamespaceName(e.target.value)}
          style={styles.nameInput}
        />
        <Button
          appearance="primary"
          onClick={onCreate}
          disabled={!newNamespaceName}
        >
          Create
        </Button>
      </Flexbox>
    </DokkimiModal>
  );
}

const styles = {
  modalContent: {
    padding: '64px 0 120px',
  },
  nameInput: {
    width: 300,
  },
} satisfies Stylesheet;
