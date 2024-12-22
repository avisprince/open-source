import { Button } from '@fluentui/react-components';
import { useState } from 'react';
import { graphql, useFragment } from 'react-relay';

import Flexbox from 'src/components/custom/Flexbox';
import TestCard from 'src/components/dashboard/content/tests/TestCard';
import TestEditModal from 'src/components/dashboard/content/tests/TestEditModal';
import ContentLayout from 'src/components/dashboard/layout/content/ContentLayout';
import { Stylesheet } from 'src/types/Stylesheet';

import { Tests_query$key } from './__generated__/Tests_query.graphql';

type Props = {
  queryRef: Tests_query$key;
};

export default function Tests({ queryRef }: Props) {
  const [showNewModal, setShowNewModal] = useState(false);

  const data = useFragment(
    graphql`
      fragment Tests_query on Query
      @argumentDefinitions(
        organizationId: { type: "ID!" }
        skipOrgQuery: { type: "Boolean!" }
      ) {
        orgTestSuites(organizationId: $organizationId)
          @skip(if: $skipOrgQuery) {
          id
          ...TestCard_testSuite
        }
      }
    `,
    queryRef,
  );

  return (
    <>
      <ContentLayout
        title="Tests"
        endContent={
          <Button appearance="primary" onClick={() => setShowNewModal(true)}>
            New
          </Button>
        }
      >
        {!!data.orgTestSuites?.length && (
          <Flexbox direction="column" gap={16} style={styles.cards}>
            {data.orgTestSuites?.map(test => (
              <TestCard key={test.id} testCardRef={test} />
            ))}
          </Flexbox>
        )}
      </ContentLayout>
      {showNewModal && (
        <TestEditModal
          testEditModalRef={null}
          onModalClose={() => setShowNewModal(false)}
          show={showNewModal}
        />
      )}
    </>
  );
}

const styles = {
  cards: {
    overflowY: 'auto',
  },
} satisfies Stylesheet;
