import { useCallback } from 'react';
import { graphql, useMutation } from 'react-relay';
import { useRecoilValue } from 'recoil';

import { TemplateType } from 'src/components/dashboard/content/templates/templateTypes';
import { sessionAtom } from 'src/recoil/dashboard/dashboard.atoms';

import { useCreateTemplateMutation } from './__generated__/useCreateTemplateMutation.graphql';

export default function useCreateTemplate() {
  const { orgId } = useRecoilValue(sessionAtom);

  const [commitCreateItemTemplate, isCreationInFlight] =
    useMutation<useCreateTemplateMutation>(graphql`
      mutation useCreateTemplateMutation(
        $organizationId: ID!
        $itemType: String!
        $displayName: String!
      ) {
        createNamespaceItemTemplate(
          organizationId: $organizationId
          itemType: $itemType
          displayName: $displayName
        ) {
          id
          template {
            itemType
            displayName
          }
        }
      }
    `);

  const onCreateItemTemplate = useCallback(
    (itemType: TemplateType, displayName: string) => {
      commitCreateItemTemplate({
        variables: {
          organizationId: orgId,
          itemType,
          displayName,
        },
        updater: store => {
          const root = store.getRoot();
          const newTemplate = store.getRootField('createNamespaceItemTemplate');

          const args = { organizationId: orgId };
          const templates =
            root.getLinkedRecords('namespaceItemTemplates', args) ?? [];

          root.setLinkedRecords(
            [...templates, newTemplate],
            'namespaceItemTemplates',
            args,
          );
        },
      });
    },
    [commitCreateItemTemplate, orgId],
  );

  return [onCreateItemTemplate, isCreationInFlight] as const;
}
