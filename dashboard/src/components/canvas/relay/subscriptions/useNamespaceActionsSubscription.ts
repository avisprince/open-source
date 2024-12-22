import { useMemo } from 'react';
import { useSubscription } from 'react-relay';
import { graphql } from 'relay-runtime';

export default function useNamespaceActionsSubscription(namespaceId: string) {
  useSubscription(
    useMemo(
      () => ({
        subscription: graphql`
          subscription useNamespaceActionsSubscription($namespaceId: ID!) {
            actionLogged(namespaceId: $namespaceId) {
              id
              ...CanvasTraffic_actions
              ...CanvasSidebarTrafficHistory_actions
              ...CanvasSidebarTrafficHistoryActionModal_actions
            }
          }
        `,
        variables: {
          namespaceId,
        },
        updater: store => {
          const newItem = store.getRootField('actionLogged');
          const namespace = store.get(namespaceId);
          const actions = namespace?.getLinkedRecords('actions');

          const newActions = actions ? [newItem, ...actions] : [newItem];
          namespace?.setLinkedRecords(newActions, 'actions');
        },
      }),
      [namespaceId],
    ),
  );
}
