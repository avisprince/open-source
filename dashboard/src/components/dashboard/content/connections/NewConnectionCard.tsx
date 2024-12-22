import { useState } from 'react';

import Flexbox from 'src/components/custom/Flexbox';
import Icon from 'src/components/custom/Icon';
import ConnectionCardModal from 'src/components/dashboard/content/connections/ConnectionCardModal';
import useCreateSecret from 'src/components/dashboard/content/connections/hooks/useCreateSecret';
import { DokkimiColorsV2 } from 'src/components/styles/colors';
import { Stylesheet } from 'src/types/Stylesheet';

export default function NewConnectionCard() {
  const [showNewSecretModal, setShowNewSecretModal] = useState(false);
  const [createSecret] = useCreateSecret();

  const onClose = () => {
    setShowNewSecretModal(false);
  };

  return (
    <>
      <Flexbox
        alignItems="center"
        justifyContent="center"
        direction="column"
        gap={8}
        style={styles.card}
        className="border border-solid border-blackQuaternary bg-blackQuaternary hover:border-salmon"
        onClick={() => setShowNewSecretModal(true)}
      >
        <Icon name="plus" />
        <div>Create new connection</div>
      </Flexbox>
      <ConnectionCardModal
        show={showNewSecretModal}
        secretRef={null}
        onClose={onClose}
        onConfirm={createSecret}
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
} satisfies Stylesheet;
