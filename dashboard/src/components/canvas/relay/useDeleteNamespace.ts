import { useCallback } from 'react';
import { useMutation } from 'react-relay';
import { graphql } from 'relay-runtime';

import { useDeleteNamespaceMutation } from './__generated__/useDeleteNamespaceMutation.graphql';

export const useDeleteNamespace = () => {
  const [commitDeleteNamespace, isDeletionInFlight] =
    useMutation<useDeleteNamespaceMutation>(graphql`
      mutation useDeleteNamespaceMutation($namespaceId: ID!) {
        deleteNamespace(namespaceId: $namespaceId) {
          id
          permissions {
            organizationId
          }
        }
      }
    `);

  const onDeleteNamespace = useCallback(
    (namespaceId: string, onCompleted?: () => void) => {
      commitDeleteNamespace({
        variables: {
          namespaceId,
        },
        onCompleted: () => {
          if (onCompleted) {
            onCompleted();
          }
        },
        updater: store => {
          const root = store.getRoot();
          const namespace = store.getRootField('deleteNamespace');

          const orgId = namespace
            .getLinkedRecord('permissions')
            .getValue('organizationId');

          const args = {
            organizationId: orgId,
            type: 'sandbox',
          };

          const namespaces = root
            .getLinkedRecords('namespaces', args)
            ?.filter(ns => ns.getValue('id') !== namespace.getValue('id'));

          root.setLinkedRecords(namespaces ?? [], 'namespaces', args);

          const userNamespaces = root
            .getLinkedRecords('userNamespaces')
            ?.filter(ns => ns.getValue('id') !== namespace.getValue('id'));

          root.setLinkedRecords(userNamespaces ?? [], 'userNamespaces');
        },
      });
    },
    [commitDeleteNamespace],
  );

  return [onDeleteNamespace, isDeletionInFlight] as const;
};
