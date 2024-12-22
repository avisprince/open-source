import { useCallback } from 'react';
import { graphql, useMutation } from 'react-relay';
import { useRecoilValue } from 'recoil';

import { sessionAtom } from 'src/recoil/dashboard/dashboard.atoms';

import { TestCaseInput } from './__generated__/useCreateTestCaseMutation.graphql';

export default function useCreateTestCase() {
  const { namespaceId } = useRecoilValue(sessionAtom);

  const [createTestCase, isLoading] = useMutation(graphql`
    mutation useCreateTestCaseMutation(
      $namespaceId: ID!
      $testCase: TestCaseInput!
    ) {
      createTestCase(namespaceId: $namespaceId, testCase: $testCase) {
        id
        ...CanvasSidebarTests_namespace
      }
    }
  `);

  const onCreateNamespace = useCallback(
    (testCase: TestCaseInput) => {
      createTestCase({
        variables: {
          namespaceId,
          testCase,
        },
      });
    },
    [namespaceId, createTestCase],
  );

  return [onCreateNamespace, isLoading] as const;
}
