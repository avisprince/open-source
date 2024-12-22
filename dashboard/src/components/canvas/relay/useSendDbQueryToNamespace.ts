import { useCallback, useState } from 'react';
import { useMutation } from 'react-relay';
import { useRecoilValue } from 'recoil';
import { graphql } from 'relay-runtime';

import { sessionAtom } from 'src/recoil/dashboard/dashboard.atoms';

import {
  useSendDbQueryToNamespaceMutation,
  useSendDbQueryToNamespaceMutation$data,
} from './__generated__/useSendDbQueryToNamespaceMutation.graphql';

export function useSendDbQueryToNamespace(itemId: string) {
  const { namespaceId } = useRecoilValue(sessionAtom);
  const [lastResult, setLastResult] = useState<
    useSendDbQueryToNamespaceMutation$data['sendDbQueryToNamespace'] | null
  >(null);

  const [commitSendDbQueryToNamespace, isSendingQuery] =
    useMutation<useSendDbQueryToNamespaceMutation>(graphql`
      mutation useSendDbQueryToNamespaceMutation(
        $namespaceId: ID!
        $itemId: String!
      ) {
        sendDbQueryToNamespace(namespaceId: $namespaceId, itemId: $itemId) {
          query
          result
        }
      }
    `);

  const runQuery = useCallback(() => {
    setLastResult(null);
    commitSendDbQueryToNamespace({
      variables: {
        namespaceId,
        itemId,
      },
      onCompleted: ({ sendDbQueryToNamespace }) => {
        setLastResult(sendDbQueryToNamespace);
      },
    });
  }, [commitSendDbQueryToNamespace, itemId, namespaceId]);

  return [runQuery, isSendingQuery, lastResult] as const;
}
