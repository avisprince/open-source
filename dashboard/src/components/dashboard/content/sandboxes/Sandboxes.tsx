import { Button } from '@fluentui/react-components';
import { useState } from 'react';
import { graphql, useFragment } from 'react-relay';

import Flexbox from 'src/components/custom/Flexbox';
import NewSandboxCard from 'src/components/dashboard/content/sandboxes/NewSandboxCard';
import NewSandboxModal from 'src/components/dashboard/content/sandboxes/NewSandboxModal';
import SandboxCard from 'src/components/dashboard/content/sandboxes/SandboxCard';
import ContentLayout from 'src/components/dashboard/layout/content/ContentLayout';
import { Stylesheet } from 'src/types/Stylesheet';

import { Sandboxes_query$key } from './__generated__/Sandboxes_query.graphql';

type Props = {
  queryRef: Sandboxes_query$key;
};

export default function Sandboxes({ queryRef }: Props) {
  const [showModal, setShowModal] = useState(false);

  const data = useFragment(
    graphql`
      fragment Sandboxes_query on Query
      @argumentDefinitions(
        organizationId: { type: "ID!" }
        skipOrgQuery: { type: "Boolean!" }
      ) {
        namespaces(organizationId: $organizationId, type: "sandbox")
          @skip(if: $skipOrgQuery) {
          id
          ...SandboxCard_namespace
        }
      }
    `,
    queryRef,
  );

  return (
    <>
      <ContentLayout
        title="Sandboxes"
        endContent={
          <Button appearance="primary" onClick={() => setShowModal(true)}>
            New
          </Button>
        }
      >
        <Flexbox alignItems="center" wrap="wrap" gap={40} style={styles.cards}>
          {!data.namespaces?.length && <NewSandboxCard />}
          {data.namespaces?.map(ns => (
            <SandboxCard key={ns.id} namespaceRef={ns} />
          ))}
        </Flexbox>
      </ContentLayout>
      <NewSandboxModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}

const styles = {
  cards: {
    paddingBottom: 32,
    overflowY: 'auto',
  },
} satisfies Stylesheet;
