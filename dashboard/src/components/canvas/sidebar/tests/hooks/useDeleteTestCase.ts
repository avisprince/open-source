import { useCallback } from 'react';
import { graphql, useMutation } from 'react-relay';
import { useRecoilValue } from 'recoil';

import { sessionAtom } from 'src/recoil/dashboard/dashboard.atoms';

export default function useDeleteTestCase() {
  const { namespaceId } = useRecoilValue(sessionAtom);

  const [deleteTestCase, isLoading] = useMutation(graphql`
    mutation useDeleteTestCaseMutation(
      $namespaceId: ID!
      $testCaseId: String!
    ) {
      deleteTestCase(namespaceId: $namespaceId, testCaseId: $testCaseId) {
        id
        ...CanvasSidebarTests_namespace
      }
    }
  `);

  const onDeleteNamespace = useCallback(
    (testCaseId: string) => {
      deleteTestCase({
        variables: {
          namespaceId,
          testCaseId,
        },
      });
    },
    [namespaceId, deleteTestCase],
  );

  return [onDeleteNamespace, isLoading] as const;
}
