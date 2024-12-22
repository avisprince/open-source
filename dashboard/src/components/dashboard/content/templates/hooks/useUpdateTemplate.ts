import { useCallback } from 'react';
import { useMutation } from 'react-relay';
import { graphql } from 'relay-runtime';

import {
  NamespaceItemTemplateInput,
  useUpdateTemplateMutation,
} from './__generated__/useUpdateTemplateMutation.graphql';

export const useUpdateTemplate = (namespaceItemTemplateId: string) => {
  const [commitUpdateNamespaceItemTemplate, isUpdateInFlight] =
    useMutation<useUpdateTemplateMutation>(
      graphql`
        mutation useUpdateTemplateMutation(
          $namespaceItemTemplateId: ID!
          $namespaceItemTemplate: NamespaceItemTemplateInput!
        ) {
          updateNamespaceItemTemplate(
            namespaceItemTemplateId: $namespaceItemTemplateId
            namespaceItemTemplate: $namespaceItemTemplate
          ) {
            id
          }
        }
      `,
    );

  const updateItemTemplate = useCallback(
    (namespaceItemTemplate: NamespaceItemTemplateInput) => {
      commitUpdateNamespaceItemTemplate({
        variables: {
          namespaceItemTemplateId,
          namespaceItemTemplate,
        },
      });
    },
    [namespaceItemTemplateId, commitUpdateNamespaceItemTemplate],
  );

  return [updateItemTemplate, isUpdateInFlight] as const;
};
