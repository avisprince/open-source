import { useCallback } from 'react';
import { useMutation } from 'react-relay';
import { useRecoilValue } from 'recoil';
import { graphql } from 'relay-runtime';

import { useActiveUserHeartbeatMutation } from 'src/components/canvas/relay/__generated__/useActiveUserHeartbeatMutation.graphql';
import { sessionAtom } from 'src/recoil/dashboard/dashboard.atoms';

export const useActiveUserHeartbeat = () => {
  const { namespaceId } = useRecoilValue(sessionAtom);
  const [commitActiveUserHeartbeat, isBeatInFlight] =
    useMutation<useActiveUserHeartbeatMutation>(graphql`
      mutation useActiveUserHeartbeatMutation(
        $namespaceId: ID!
        $peerId: String!
      ) {
        activeUserHeartbeat(namespaceId: $namespaceId, peerId: $peerId)
      }
    `);

  const triggerActiveUserHeartbeat = useCallback(
    (peerId: string) => {
      if (!peerId) {
        return;
      }

      commitActiveUserHeartbeat({
        variables: {
          namespaceId,
          peerId,
        },
      });
    },
    [commitActiveUserHeartbeat, namespaceId],
  );

  return [triggerActiveUserHeartbeat, isBeatInFlight] as const;
};
