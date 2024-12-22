import { Button, Input } from '@fluentui/react-components';
import { useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import { useNavigate, useParams } from 'react-router-dom';

import DokkimiModal from 'src/components/custom/DokkimiModal';
import Flexbox from 'src/components/custom/Flexbox';
import useCreateOrganization from 'src/components/dashboard/layout/sidebar/hooks/useCreateOrganization';
import { Stylesheet } from 'src/types/Stylesheet';

import { NewOrgModal_user$key } from './__generated__/NewOrgModal_user.graphql';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  currUserRef: NewOrgModal_user$key;
};

export default function NewOrgModal({ isOpen, onClose, currUserRef }: Props) {
  const { tab } = useParams();

  const [newOrgName, setNewOrgName] = useState('');
  const [createOrg] = useCreateOrganization();
  const navigate = useNavigate();

  const currUser = useFragment(
    graphql`
      fragment NewOrgModal_user on User {
        email
      }
    `,
    currUserRef,
  );

  const navigateToOrg = (orgId: string) => {
    navigate(`/dashboard/${orgId}/${tab}`);
  };

  const onModalClose = () => {
    setNewOrgName('');
    onClose();
  };

  const onCreate = () => {
    createOrg(newOrgName, currUser.email, navigateToOrg);
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
        <div>Create New Organization</div>
        <Input
          placeholder="Enter organization name"
          value={newOrgName}
          onChange={e => setNewOrgName(e.target.value)}
          style={styles.nameInput}
        />
        <Button appearance="primary" onClick={onCreate} disabled={!newOrgName}>
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
