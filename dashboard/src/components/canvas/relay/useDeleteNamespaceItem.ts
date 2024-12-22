import { useCallback } from 'react';
import { useMutation } from 'react-relay';
import { useRecoilValue } from 'recoil';
import { graphql } from 'relay-runtime';

import { sessionAtom } from 'src/recoil/dashboard/dashboard.atoms';

import { useDeleteNamespaceItemMutation } from './__generated__/useDeleteNamespaceItemMutation.graphql';

export const useDeleteNamespaceItem = (itemId: string) => {
  const { namespaceId } = useRecoilValue(sessionAtom);
  const [commitDeleteItemFromNamespace, isDeletionInFlight] =
    useMutation<useDeleteNamespaceItemMutation>(graphql`
      mutation useDeleteNamespaceItemMutation(
        $namespaceId: ID!
        $itemId: String!
      ) {
        deleteItemFromNamespace(namespaceId: $namespaceId, itemId: $itemId) {
          itemId
          itemType
        }
      }
    `);

  const deleteItem = useCallback(() => {
    commitDeleteItemFromNamespace({
      variables: {
        namespaceId,
        itemId,
      },
      updater: store => {
        const namespace = store.get(namespaceId);
        const deletedItems = store.getPluralRootField(
          'deleteItemFromNamespace',
        );

        if (!namespace) {
          return null;
        }

        const setLinkedRecord = (type: string) => {
          const currItems = namespace.getLinkedRecords(type);
          const newItems =
            currItems?.filter(item => item.getValue('itemId') !== itemId) ?? [];
          namespace.setLinkedRecords(newItems, type);
        };

        setLinkedRecord('items');

        deletedItems?.forEach(deletedItem => {
          if (!deletedItem) {
            return;
          }

          const itemType = deletedItem.getValue('itemType');

          if (itemType === 'Service') {
            setLinkedRecord('services');
          } else if (itemType === 'Database') {
            setLinkedRecord('databases');
          } else if (itemType === 'HttpRequest') {
            setLinkedRecord('httpRequests');
          } else if (itemType === 'MockEndpoint') {
            setLinkedRecord('mockEndpoints');
          } else if (itemType === 'DbQuery') {
            setLinkedRecord('dbQueries');
          } else if (itemType === 'TestCase') {
            setLinkedRecord('testCases');
          } else if (itemType === 'TrafficHistory') {
            setLinkedRecord('trafficHistories');
          } else if (itemType === 'QueryHistory') {
            setLinkedRecord('queryHistories');
          }
        });
      },
    });
  }, [commitDeleteItemFromNamespace, itemId, namespaceId]);

  return [deleteItem, isDeletionInFlight] as const;
};
