import { useCallback } from 'react';
import { useMutation } from 'react-relay';
import { graphql } from 'relay-runtime';

import { useDeleteTemplateMutation } from './__generated__/useDeleteTemplateMutation.graphql';

export default function useDeleteTemplate() {
  const [deleteTemplate, isDeletionInFlight] =
    useMutation<useDeleteTemplateMutation>(
      graphql`
        mutation useDeleteTemplateMutation($namespaceItemTemplateId: ID!) {
          deleteNamespaceItemTemplate(
            namespaceItemTemplateId: $namespaceItemTemplateId
          ) {
            id
            permissions {
              organizationId
            }
          }
        }
      `,
    );

  const onDelete = useCallback(
    (namespaceItemTemplateId: string) => {
      deleteTemplate({
        variables: {
          namespaceItemTemplateId,
        },
        updater: store => {
          const root = store.getRoot();
          const template = store.getRootField('deleteNamespaceItemTemplate');
          const templateId = template.getValue('id');

          const orgId = template
            .getLinkedRecord('permissions')
            .getValue('organizationId');

          const args = { organizationId: orgId };

          const templates =
            root
              .getLinkedRecords('namespaceItemTemplates', args)
              ?.filter(ns => ns.getValue('id') !== templateId) ?? [];

          root.setLinkedRecords(templates, 'namespaceItemTemplates', args);
        },
      });
    },
    [deleteTemplate],
  );

  return [onDelete, isDeletionInFlight] as const;
}
