import { Button } from '@fluentui/react-components';
import { useState } from 'react';
import { graphql, useFragment } from 'react-relay';

import Flexbox from 'src/components/custom/Flexbox';
import ConnectionCard from 'src/components/dashboard/content/connections/ConnectionCard';
import ConnectionCardModal from 'src/components/dashboard/content/connections/ConnectionCardModal';
import NewConnectionCard from 'src/components/dashboard/content/connections/NewConnectionCard';
import useCreateSecret from 'src/components/dashboard/content/connections/hooks/useCreateSecret';
import ContentLayout from 'src/components/dashboard/layout/content/ContentLayout';
import { Stylesheet } from 'src/types/Stylesheet';

import { Connections_query$key } from './__generated__/Connections_query.graphql';

type Props = {
  queryRef: Connections_query$key;
};

export default function Connections({ queryRef }: Props) {
  const [showNewSecretModal, setShowNewSecretModal] = useState(false);
  const [createSecret] = useCreateSecret();

  const onClose = () => {
    setShowNewSecretModal(false);
  };

  const data = useFragment(
    graphql`
      fragment Connections_query on Query
      @argumentDefinitions(
        organizationId: { type: "ID!" }
        skipOrgQuery: { type: "Boolean!" }
      ) {
        orgSecrets(organizationId: $organizationId) @skip(if: $skipOrgQuery) {
          id
          ...ConnectionCard_secret
        }
      }
    `,
    queryRef,
  );

  return (
    <>
      <ContentLayout
        title="Connections"
        endContent={
          <Button
            appearance="primary"
            onClick={() => setShowNewSecretModal(true)}
          >
            New
          </Button>
        }
      >
        <Flexbox wrap="wrap" gap={16} style={styles.cards}>
          {!data.orgSecrets?.length && <NewConnectionCard />}
          {data.orgSecrets?.map(secret => (
            <ConnectionCard key={secret.id} secretKey={secret} />
          ))}
        </Flexbox>
      </ContentLayout>
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
  cards: {
    overflowY: 'auto',
  },
} satisfies Stylesheet;
