import { useCallback, useState } from 'react';
import { useMutation } from 'react-relay';
import { useRecoilValue } from 'recoil';
import { graphql } from 'relay-runtime';

import { sessionAtom } from 'src/recoil/dashboard/dashboard.atoms';

import {
  useSendRequestToNamespaceMutation,
  useSendRequestToNamespaceMutation$data,
} from './__generated__/useSendRequestToNamespaceMutation.graphql';

export function useSendRequestToNamespace(itemId: string) {
  const { namespaceId } = useRecoilValue(sessionAtom);
  const [lastResult, setLastResult] = useState<
    useSendRequestToNamespaceMutation$data['sendRequestToNamespace'] | null
  >(null);

  const [commitSendRequestToNamespace, isSendingRequest] =
    useMutation<useSendRequestToNamespaceMutation>(graphql`
      mutation useSendRequestToNamespaceMutation(
        $namespaceId: ID!
        $itemId: String!
      ) {
        sendRequestToNamespace(namespaceId: $namespaceId, itemId: $itemId) {
          status
          data
          headers
        }
      }
    `);

  const sendRequest = useCallback(() => {
    setLastResult(null);
    commitSendRequestToNamespace({
      variables: {
        namespaceId,
        itemId,
      },
      onCompleted: response => {
        setLastResult(response.sendRequestToNamespace);
      },
    });
  }, [commitSendRequestToNamespace, namespaceId, itemId]);

  return [sendRequest, isSendingRequest, lastResult] as const;
}
