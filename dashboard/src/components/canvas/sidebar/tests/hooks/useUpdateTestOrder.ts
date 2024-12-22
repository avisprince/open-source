import { useCallback } from 'react';
import { graphql, useMutation } from 'react-relay';
import { useRecoilValue } from 'recoil';

import { sessionAtom } from 'src/recoil/dashboard/dashboard.atoms';

export default function useUpdateTestOrder() {
  const { namespaceId } = useRecoilValue(sessionAtom);

  const [updateTestOrder, isLoading] = useMutation(graphql`
    mutation useUpdateTestOrderMutation(
      $namespaceId: ID!
      $testCaseIds: [String!]!
    ) {
      updateTestOrder(namespaceId: $namespaceId, testCaseIds: $testCaseIds) {
        id
        ...CanvasSidebarTests_namespace
      }
    }
  `);

  const onUpdateTestOrder = useCallback(
    (testCaseIds: string[], onCompleted?: () => void) => {
      updateTestOrder({
        variables: {
          namespaceId,
          testCaseIds,
        },
        onCompleted,
      });
    },
    [namespaceId, updateTestOrder],
  );

  return [onUpdateTestOrder, isLoading] as const;
}
