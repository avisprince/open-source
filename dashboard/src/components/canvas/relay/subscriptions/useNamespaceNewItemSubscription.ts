import { useMemo } from 'react';
import { useSubscription } from 'react-relay';
import { graphql } from 'relay-runtime';

export default function useNamespaceNewItemSubscription(namespaceId: string) {
  useSubscription(
    useMemo(
      () => ({
        subscription: graphql`
          subscription useNamespaceNewItemSubscription($namespaceId: ID!) {
            newNamespaceItem(namespaceId: $namespaceId) {
              itemType
              itemId
              ...CanvasItems_namespaceItems
            }
          }
        `,
        variables: {
          namespaceId,
        },
        updater: store => {
          const namespace = store.get(namespaceId);
          const newItem = store.getRootField('newNamespaceItem');
          if (!newItem || !namespace) {
            return null;
          }

          const setLinkedRecord = (type: string) => {
            const currItems = namespace.getLinkedRecords(type);
            const newItems = currItems ? [...currItems, newItem] : [newItem];
            namespace.setLinkedRecords(newItems, type);
          };

          setLinkedRecord('items');

          const itemType = newItem.getValue('itemType');

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
        },
      }),
      [namespaceId],
    ),
  );
}
