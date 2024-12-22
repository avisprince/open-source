import { Button } from '@fluentui/react-components';
import { graphql, useFragment } from 'react-relay';
import { useRecoilValue } from 'recoil';

import Flexbox from 'src/components/custom/Flexbox';
import DatabaseFileCard from 'src/components/dashboard/content/databaseFiles/DatabaseFileCard';
import NewDatabaseFileCard from 'src/components/dashboard/content/databaseFiles/NewDatabaseFileCard';
import NewDatabaseFileModal from 'src/components/dashboard/content/databaseFiles/NewDatabaseFileModal';
import ContentLayout from 'src/components/dashboard/layout/content/ContentLayout';
import useToggleState from 'src/hooks/useToggleState';
import { sessionAtom } from 'src/recoil/dashboard/dashboard.atoms';
import { Stylesheet } from 'src/types/Stylesheet';

import { DatabaseFiles_query$key } from './__generated__/DatabaseFiles_query.graphql';

type Props = {
  queryRef: DatabaseFiles_query$key;
};

export default function DatabaseFiles({ queryRef }: Props) {
  const [showModal, setShowModal] = useToggleState(false);
  const { orgId } = useRecoilValue(sessionAtom);

  const { orgDbInitFiles } = useFragment(
    graphql`
      fragment DatabaseFiles_query on Query
      @argumentDefinitions(
        organizationId: { type: "ID!" }
        skipOrgQuery: { type: "Boolean!" }
      ) {
        orgDbInitFiles(organizationId: $organizationId)
          @skip(if: $skipOrgQuery) {
          id
          ...DatabaseFileCard_file
        }
      }
    `,
    queryRef,
  );

  return (
    <>
      <ContentLayout
        title="Database Files"
        endContent={
          <Button appearance="primary" onClick={setShowModal}>
            New
          </Button>
        }
      >
        <Flexbox wrap="wrap" gap={16} style={styles.cards}>
          {!orgDbInitFiles?.length && <NewDatabaseFileCard />}
          {orgDbInitFiles?.map(file => (
            <DatabaseFileCard key={file.id} fileRef={file} />
          ))}
        </Flexbox>
      </ContentLayout>
      <NewDatabaseFileModal
        isOpen={showModal}
        onClose={setShowModal}
        orgId={orgId}
      />
    </>
  );
}

const styles = {
  cards: {
    overflowY: 'auto',
  },
} satisfies Stylesheet;
