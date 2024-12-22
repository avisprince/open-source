import { useState } from 'react';

import Flexbox from 'src/components/custom/Flexbox';
import Icon from 'src/components/custom/Icon';
import NewSandboxModal from 'src/components/dashboard/content/sandboxes/NewSandboxModal';
import { Stylesheet } from 'src/types/Stylesheet';

export default function NewSandboxCard() {
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <>
      <Flexbox
        alignItems="center"
        justifyContent="center"
        direction="column"
        gap={12}
        style={styles.container}
        className="border border-solid border-[#434343] bg-blackQuaternary hover:border-salmon"
        onClick={() => setShowCreateModal(true)}
      >
        <Icon name="plus" />
        <div>Create new sandbox</div>
      </Flexbox>
      <NewSandboxModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </>
  );
}

const styles = {
  container: {
    height: 304,
    width: 352,
    borderRadius: 8,
    cursor: 'pointer',
  },
} satisfies Stylesheet;
