import { useMemo } from 'react';
import { useSubscription } from 'react-relay';
import { graphql } from 'relay-runtime';

export default function useNamespaceDeleteItemsSubscription(
  namespaceId: string,
) {
  useSubscription(
    useMemo(
      () => ({
        subscription: graphql`
          subscription useNamespaceDeleteItemsSubscription($namespaceId: ID!) {
            deleteNamespaceItems(namespaceId: $namespaceId) {
              itemIds
            }
          }
        `,
        variables: {
          namespaceId,
        },
        updater: store => {
          const deletedItems = store.getRootField('deleteNamespaceItems');
          const deletedItemIds = deletedItems?.getValue('itemIds') as string[];

          const namespace = store.get(namespaceId);
          const items = namespace?.getLinkedRecords('items');

          namespace?.setLinkedRecords(
            items?.filter(
              item =>
                !deletedItemIds.includes(item.getValue('itemId') as string),
            ),
            'items',
          );
        },
      }),
      [namespaceId],
    ),
  );
}
