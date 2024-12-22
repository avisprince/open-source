import { useCallback } from 'react';
import { graphql, useMutation } from 'react-relay';
import { useRecoilValue } from 'recoil';

import { sessionAtom } from 'src/recoil/dashboard/dashboard.atoms';

import { TestCaseInput } from './__generated__/useUpdateTestCaseMutation.graphql';

export default function useUpdateTestCase() {
  const { namespaceId } = useRecoilValue(sessionAtom);

  const [updateTestCase, isLoading] = useMutation(graphql`
    mutation useUpdateTestCaseMutation(
      $namespaceId: ID!
      $testCase: TestCaseInput!
    ) {
      updateTestCase(namespaceId: $namespaceId, testCase: $testCase) {
        id
        ...CanvasSidebarTests_namespace
      }
    }
  `);

  const onUpdateTestCase = useCallback(
    (testCase: TestCaseInput) => {
      updateTestCase({
        variables: {
          namespaceId,
          testCase,
        },
      });
    },
    [namespaceId, updateTestCase],
  );

  return [onUpdateTestCase, isLoading] as const;
}
