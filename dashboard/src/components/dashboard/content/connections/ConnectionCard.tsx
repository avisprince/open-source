import { faAws, faDocker } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useMemo, useState } from 'react';
import { graphql, useFragment } from 'react-relay';

import ConfirmModal from 'src/components/custom/ConfirmModal';
import Flexbox from 'src/components/custom/Flexbox';
import ConnectionCardModal from 'src/components/dashboard/content/connections/ConnectionCardModal';
import useDeleteSecret from 'src/components/dashboard/content/connections/hooks/useDeleteSecret';
import useUpdateSecret from 'src/components/dashboard/content/connections/hooks/useUpdateSecret';
import { DokkimiColorsV2 } from 'src/components/styles/colors';
import { Stylesheet } from 'src/types/Stylesheet';

import EditDeleteMenu from '../shared/EditDeleteMenu';
import { ConnectionCard_secret$key } from './__generated__/ConnectionCard_secret.graphql';
import { DockerRegistrySecretInput } from './hooks/__generated__/useUpdateSecretMutation.graphql';

type Props = {
  secretKey: ConnectionCard_secret$key;
};

export default function ConnectionCard({ secretKey }: Props) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [deleteSecret] = useDeleteSecret();
  const [updateSecret] = useUpdateSecret();
  const secret = useFragment(
    graphql`
      fragment ConnectionCard_secret on DockerRegistrySecret {
        id
        name
        repository
        ...ConnectionCardModal_secret
      }
    `,
    secretKey,
  );

  const logo = useMemo(() => {
    switch (secret.repository) {
      case 'Docker': {
        return (
          <FontAwesomeIcon icon={faDocker} color="#2396EE" fontSize={24} />
        );
      }
      case 'ECR': {
        return <FontAwesomeIcon icon={faAws} color="#FF9900" fontSize={24} />;
      }
      default: {
        return null;
      }
    }
  }, [secret.repository]);

  const onDelete = () => {
    deleteSecret(secret.id);
    setShowDeleteModal(false);
  };

  const onUpdate = (updatedSecret: DockerRegistrySecretInput) => {
    updateSecret(secret.id, updatedSecret);
    setShowDeleteModal(false);
  };

  return (
    <Flexbox
      alignItems="center"
      justifyContent="space-between"
      style={styles.card}
    >
      <Flexbox alignItems="center" gap={16}>
        {logo}
        <div>{secret.name}</div>
      </Flexbox>
      <EditDeleteMenu
        onEdit={() => setShowEditModal(true)}
        onDelete={() => setShowDeleteModal(true)}
      />
      <ConfirmModal
        isOpen={showDeleteModal}
        toggle={() => setShowDeleteModal(false)}
        title="Delete Connection"
        subtitle={`Are you sure you want to delete the ${secret.repository} connection ${secret.name}?`}
        buttonText="Delete"
        onConfirm={onDelete}
      />
      <ConnectionCardModal
        show={showEditModal}
        secretRef={secret}
        onClose={() => setShowEditModal(false)}
        onConfirm={onUpdate}
      />
    </Flexbox>
  );
}

const styles = {
  card: {
    height: 80,
    width: 'calc(50% - 8px)',
    padding: 16,
    borderRadius: 4,
    backgroundColor: DokkimiColorsV2.blackQuaternary,
  },
  content: {
    marginLeft: 44,
  },
} satisfies Stylesheet;
