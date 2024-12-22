import { useRecoilValue } from 'recoil';

import Flexbox from 'src/components/custom/Flexbox';
import Icon from 'src/components/custom/Icon';
import NewDatabaseFileModal from 'src/components/dashboard/content/databaseFiles/NewDatabaseFileModal';
import { DokkimiColorsV2 } from 'src/components/styles/colors';
import useToggleState from 'src/hooks/useToggleState';
import { sessionAtom } from 'src/recoil/dashboard/dashboard.atoms';
import { Stylesheet } from 'src/types/Stylesheet';

export default function NewDatabaseFileCard() {
  const [showUploadModal, setShowUploadModal] = useToggleState(false);
  const { orgId } = useRecoilValue(sessionAtom);

  return (
    <>
      <Flexbox
        alignItems="center"
        justifyContent="center"
        direction="column"
        gap={8}
        style={styles.card}
        className="border border-solid border-blackQuaternary bg-blackQuaternary hover:border-salmon"
        onClick={setShowUploadModal}
      >
        <Icon name="plus" />
        <div>Upload database file</div>
      </Flexbox>
      <NewDatabaseFileModal
        isOpen={showUploadModal}
        onClose={setShowUploadModal}
        orgId={orgId}
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
