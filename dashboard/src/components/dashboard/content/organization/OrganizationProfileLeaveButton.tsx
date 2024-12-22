import { Button } from '@fluentui/react-components';

import ConfirmModal from 'src/components/custom/ConfirmModal';
import useLeaveOrganization from 'src/components/dashboard/content/organization/hooks/useLeaveOrganization';
import useToggleState from 'src/hooks/useToggleState';

type Props = {
  email: string;
  onLeave: () => void;
};

export default function OrganizationProfileLeaveButton({
  email,
  onLeave,
}: Props) {
  const [showConfirmModal, toggleConfirmModal] = useToggleState(false);
  const [leaveOrg] = useLeaveOrganization();

  const onConfirmLeaveOrg = () => {
    leaveOrg(email, onLeave);
  };

  return (
    <>
      <Button onClick={toggleConfirmModal}>Leave</Button>
      <ConfirmModal
        isOpen={showConfirmModal}
        onConfirm={onConfirmLeaveOrg}
        title={`Are you sure you want to leave the organization?`}
        buttonText="Leave"
        toggle={toggleConfirmModal}
      />
    </>
  );
}
