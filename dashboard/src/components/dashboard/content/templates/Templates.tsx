import { Button } from '@fluentui/react-components';
import { useState } from 'react';
import { graphql, useFragment } from 'react-relay';

import Flexbox from 'src/components/custom/Flexbox';
import NewTemplateCard from 'src/components/dashboard/content/templates/NewTemplateCard';
import NewTemplateModal from 'src/components/dashboard/content/templates/NewTemplateModal';
import TemplateCard from 'src/components/dashboard/content/templates/TemplateCard';
import ContentLayout from 'src/components/dashboard/layout/content/ContentLayout';
import { Stylesheet } from 'src/types/Stylesheet';

import { Templates_query$key } from './__generated__/Templates_query.graphql';

type Props = {
  queryRef: Templates_query$key;
};

export default function Templates({ queryRef }: Props) {
  const [showModal, setShowModal] = useState(false);

  const data = useFragment(
    graphql`
      fragment Templates_query on Query
      @argumentDefinitions(
        organizationId: { type: "ID!" }
        skipOrgQuery: { type: "Boolean!" }
      ) {
        namespaceItemTemplates(organizationId: $organizationId)
          @skip(if: $skipOrgQuery) {
          id
          ...TemplateCard_template
        }
      }
    `,
    queryRef,
  );

  return (
    <>
      <ContentLayout
        title="Templates"
        endContent={
          <Button appearance="primary" onClick={() => setShowModal(true)}>
            New
          </Button>
        }
      >
        <Flexbox wrap="wrap" gap={16} style={styles.cards}>
          {!data.namespaceItemTemplates?.length && <NewTemplateCard />}
          {data.namespaceItemTemplates?.map(template => (
            <TemplateCard key={template.id} templateRef={template} />
          ))}
        </Flexbox>
      </ContentLayout>
      <NewTemplateModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
}

const styles = {
  cards: {
    overflowY: 'auto',
  },
} satisfies Stylesheet;
