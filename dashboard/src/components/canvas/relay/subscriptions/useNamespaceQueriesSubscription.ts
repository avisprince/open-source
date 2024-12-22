import { useMemo } from 'react';
import { useSubscription } from 'react-relay';
import { graphql } from 'relay-runtime';

export default function useNamespaceQueriesSubscription(namespaceId: string) {
  useSubscription(
    useMemo(
      () => ({
        subscription: graphql`
          subscription useNamespaceQueriesSubscription($namespaceId: ID!) {
            queryLogged(namespaceId: $namespaceId) {
              queryId
              query
              timestamp
              originItemId
              databaseItemId
            }
          }
        `,
        variables: {
          namespaceId,
        },
        updater: store => {
          const queryLogged = store.getRootField('queryLogged');
          if (!queryLogged) {
            return;
          }

          const queryId = queryLogged.getValue('queryId');
          const newQuery = store.create(queryId as string, 'QueryLog');
          newQuery.copyFieldsFrom(queryLogged);

          const namespace = store.get(namespaceId);
          const queries = namespace?.getLinkedRecords('queries') ?? [];
          namespace?.setLinkedRecords([...queries, newQuery], 'queries');
        },
      }),
      [namespaceId],
    ),
  );
}
