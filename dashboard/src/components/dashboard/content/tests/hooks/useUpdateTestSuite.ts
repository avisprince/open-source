import { useCallback } from 'react';
import { useMutation } from 'react-relay';
import { graphql } from 'relay-runtime';

import { TestSuiteInput } from './__generated__/useCreateTestSuiteMutation.graphql';
import { useUpdateTestSuiteMutation } from './__generated__/useUpdateTestSuiteMutation.graphql';

export default function useUpdateTestSuite() {
  const [commitUpdateTestSuite, isUpdateInFlight] =
    useMutation<useUpdateTestSuiteMutation>(graphql`
      mutation useUpdateTestSuiteMutation(
        $testSuiteId: ID!
        $testSuite: TestSuiteInput!
      ) {
        updateTestSuite(testSuiteId: $testSuiteId, testSuite: $testSuite) {
          id
          ...TestCard_testSuite
        }
      }
    `);

  const onUpdateTestSuite = useCallback(
    (testSuiteId: string, testSuite: TestSuiteInput) => {
      commitUpdateTestSuite({
        variables: {
          testSuiteId,
          testSuite,
        },
      });
    },
    [commitUpdateTestSuite],
  );

  return [onUpdateTestSuite, isUpdateInFlight] as const;
}
