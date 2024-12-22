import { Button } from '@fluentui/react-components';

import ConfirmModal from 'src/components/custom/ConfirmModal';
import useDeleteOrganization from 'src/components/dashboard/content/organization/hooks/useDeleteOrganization';
import useToggleState from 'src/hooks/useToggleState';

type Props = {
  onDelete: () => void;
};

export default function OrganizationProfileDeleteButton({ onDelete }: Props) {
  const [showConfirmModal, toggleConfirmModal] = useToggleState(false);
  const [deleteOrg] = useDeleteOrganization();

  const onConfirmDeleteOrg = () => {
    deleteOrg(onDelete);
  };

  return (
    <>
      <Button appearance="primary" onClick={toggleConfirmModal}>
        Delete
      </Button>
      <ConfirmModal
        isOpen={showConfirmModal}
        onConfirm={onConfirmDeleteOrg}
        title={`Are you sure you want to delete the organization?`}
        buttonText="Delete"
        toggle={toggleConfirmModal}
      />
    </>
  );
}
