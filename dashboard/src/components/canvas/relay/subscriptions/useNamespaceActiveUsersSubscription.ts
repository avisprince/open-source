import { useMemo } from 'react';
import { useSubscription } from 'react-relay';
import { graphql } from 'relay-runtime';

export default function useNamespaceActiveUsersSubscription(
  namespaceId: string,
  orgId: string,
) {
  useSubscription(
    useMemo(
      () => ({
        subscription: graphql`
          subscription useNamespaceActiveUsersSubscription(
            $orgId: ID!
            $namespaceId: ID!
          ) {
            namespaceActiveUsers(orgId: $orgId, namespaceId: $namespaceId) {
              orgId
              namespaceId
              activeUsers {
                peerId
                color
                user {
                  name
                  email
                  picture
                }
              }
            }
          }
        `,
        variables: {
          orgId,
          namespaceId,
        },
      }),
      [namespaceId, orgId],
    ),
  );
}
