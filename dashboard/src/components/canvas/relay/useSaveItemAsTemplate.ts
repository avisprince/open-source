import { useCallback } from 'react';
import { useMutation } from 'react-relay';
import { useRecoilValue } from 'recoil';
import { graphql } from 'relay-runtime';

import { sessionAtom } from 'src/recoil/dashboard/dashboard.atoms';

import { useSaveItemAsTemplateMutation } from './__generated__/useSaveItemAsTemplateMutation.graphql';

export default function useSaveItemAsTemplate(itemId: string) {
  const { namespaceId, orgId } = useRecoilValue(sessionAtom);
  const [commitSaveItemAsTemplate, isSaveInFlight] =
    useMutation<useSaveItemAsTemplateMutation>(graphql`
      mutation useSaveItemAsTemplateMutation(
        $namespaceId: ID!
        $itemId: String!
      ) {
        saveItemAsTemplate(namespaceId: $namespaceId, itemId: $itemId) {
          id
          ...CanvasSidebarTemplates_templates
        }
      }
    `);

  const onSaveItemAsTemplate = useCallback(() => {
    commitSaveItemAsTemplate({
      variables: {
        namespaceId,
        itemId,
      },
      updater: store => {
        const root = store.getRoot();
        const newTemplate = store.getRootField('saveItemAsTemplate');

        const args = { organizationId: orgId };
        const templates =
          root.getLinkedRecords('namespaceItemTemplates', args) ?? [];

        root.setLinkedRecords(
          [...templates, newTemplate],
          'namespaceItemTemplates',
          args,
        );

        const userTemplates =
          root.getLinkedRecords('userNamespaceItemTemplates') ?? [];

        root.setLinkedRecords(
          [...userTemplates, newTemplate],
          'userNamespaceItemTemplates',
        );
      },
    });
  }, [commitSaveItemAsTemplate, namespaceId, itemId, orgId]);

  return [onSaveItemAsTemplate, isSaveInFlight] as const;
}
