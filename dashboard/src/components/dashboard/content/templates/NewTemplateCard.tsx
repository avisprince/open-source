import { useState } from 'react';

import Flexbox from 'src/components/custom/Flexbox';
import Icon from 'src/components/custom/Icon';
import NewTemplateModal from 'src/components/dashboard/content/templates/NewTemplateModal';
import { DokkimiColorsV2 } from 'src/components/styles/colors';
import { Stylesheet } from 'src/types/Stylesheet';

export default function NewTemplateCard() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Flexbox
        alignItems="center"
        justifyContent="center"
        direction="column"
        gap={8}
        style={styles.card}
        className="border border-solid border-blackQuaternary bg-blackQuaternary hover:border-salmon"
        onClick={() => setShowModal(true)}
      >
        <Icon name="plus" />
        <div>Create new template</div>
      </Flexbox>
      <NewTemplateModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
}

const styles = {
  card: {
    height: 80,
    width: 'calc(50% - 8px)',
    padding: 16,
    borderRadius: 4,
    backgroundColor: DokkimiColorsV2.blackQuaternary,
    cursor: 'pointer',
  },
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
