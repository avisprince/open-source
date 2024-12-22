import { useMemo } from 'react';
import { useSubscription } from 'react-relay';
import { graphql } from 'relay-runtime';

export default function useNamespaceUpdateItemSubscription(
  namespaceId: string,
) {
  useSubscription(
    useMemo(
      () => ({
        subscription: graphql`
          subscription useNamespaceUpdateItemSubscription($namespaceId: ID!) {
            updateNamespaceItem(namespaceId: $namespaceId) {
              itemId
              itemType
              ...CanvasItems_namespaceItems
            }
          }
        `,
        variables: {
          namespaceId,
        },
        updater: store => {
          const updatedItem = store.getRootField('updateNamespaceItem');
          const itemId = updatedItem?.getValue('itemId');

          const namespaceProxy = store.get(namespaceId);
          const items = namespaceProxy?.getLinkedRecords('items');
          const itemToUpdate = items?.find(
            item => item.getValue('itemId') === itemId,
          );

          if (!itemToUpdate || !updatedItem) {
            return;
          }

          itemToUpdate.copyFieldsFrom(updatedItem);

          const services = namespaceProxy?.getLinkedRecords('services');
          const serviceToUpdate = services?.find(
            service => service.getValue('itemId') === itemId,
          );

          if (!serviceToUpdate) {
            return;
          }

          serviceToUpdate.copyFieldsFrom(updatedItem);
        },
      }),
      [namespaceId],
    ),
  );
}
