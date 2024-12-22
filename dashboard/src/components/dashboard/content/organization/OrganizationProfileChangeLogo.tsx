import { Avatar, Button } from '@fluentui/react-components';
import { useState } from 'react';
import AvatarEditor from 'react-avatar-edit';
import { graphql, useFragment } from 'react-relay';

import DokkimiAvatar from 'src/components/custom/DokkimiAvatar';
import DokkimiModal from 'src/components/custom/DokkimiModal';
import Flexbox from 'src/components/custom/Flexbox';
import { Stylesheet } from 'src/types/Stylesheet';

import { OrganizationProfileChangeLogo_organization$key } from './__generated__/OrganizationProfileChangeLogo_organization.graphql';
import useUpdateOrganization from './hooks/useUpdateOrganization';

type Props = {
  organizationRef: OrganizationProfileChangeLogo_organization$key | null;
};

export default function OrganizationProfileChangeLogo({
  organizationRef,
}: Props) {
  const organization = useFragment(
    graphql`
      fragment OrganizationProfileChangeLogo_organization on Organization {
        image
      }
    `,
    organizationRef,
  );

  const [showModal, setShowModal] = useState(false);
  const [editedImage, setEditedImage] = useState(organization?.image ?? '');

  const [updateOrg] = useUpdateOrganization();

  const onSave = () => {
    updateOrg({ image: editedImage });
    setShowModal(false);
  };

  const onBeforeFileLoad = (element: React.ChangeEvent<HTMLInputElement>) => {
    if (!element.target.files) {
      return;
    }

    if (element.target.files[0].size > 1000000) {
      alert('File is too big!');
      element.target.value = '';
    }
  };

  const onCrop = (data: string) => {
    setEditedImage(data);
  };

  const onCloseEditor = () => {
    setEditedImage('');
  };

  const onCloseModal = () => {
    setEditedImage(organization?.image ?? '');
    setShowModal(false);
  };

  return (
    <Flexbox
      grow={1}
      alignItems="center"
      justifyContent="center"
      direction="column"
      gap={16}
    >
      <DokkimiAvatar src={organization?.image} size={120} />
      <Button onClick={() => setShowModal(true)}>Change Logo</Button>
      <DokkimiModal
        isOpen={showModal}
        toggle={onCloseModal}
        width={600}
        showCloseButton={true}
      >
        <Flexbox
          alignItems="center"
          justifyContent="center"
          direction="column"
          style={styles.modalContent}
          gap={16}
        >
          <div>Change Logo</div>
          <AvatarEditor
            width={388}
            height={296}
            onBeforeFileLoad={onBeforeFileLoad}
            onCrop={onCrop}
            onClose={onCloseEditor}
            src={organization?.image ?? ''}
          />
          <Button appearance="primary" onClick={onSave}>
            Save
          </Button>
        </Flexbox>
      </DokkimiModal>
    </Flexbox>
  );
}

const styles = {
  modalContent: {
    padding: '64px 0 120px',
  },
} satisfies Stylesheet;
