import { useCallback } from 'react';
import { graphql, useMutation } from 'react-relay';
import { useRecoilValue } from 'recoil';

import { sessionAtom } from 'src/recoil/dashboard/dashboard.atoms';

export default function useClearTrafficHistory() {
  const { namespaceId } = useRecoilValue(sessionAtom);

  const [clearTrafficHistory, isLoading] = useMutation(graphql`
    mutation useClearTrafficHistoryMutation($namespaceId: ID!) {
      clearNamespaceTraffic(namespaceId: $namespaceId) {
        id
        actions {
          __typename
        }
      }
    }
  `);

  const onClearTrafficHistory = useCallback(() => {
    clearTrafficHistory({
      variables: {
        namespaceId,
      },
    });
  }, [namespaceId, clearTrafficHistory]);

  return [onClearTrafficHistory, isLoading] as const;
}
