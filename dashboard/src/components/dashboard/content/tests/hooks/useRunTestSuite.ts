import { useCallback } from 'react';
import { useMutation } from 'react-relay';
import { graphql } from 'relay-runtime';

import { useRunTestSuiteMutation } from './__generated__/useRunTestSuiteMutation.graphql';

export default function useRunTestSuite() {
  const [commitRunTestSuite, isRunInFlight] =
    useMutation<useRunTestSuiteMutation>(graphql`
      mutation useRunTestSuiteMutation($testSuiteId: ID!) {
        runTestSuite(testSuiteId: $testSuiteId) {
          ...TestCard_testSuite
        }
      }
    `);

  const onRunTestSuite = useCallback(
    (testSuiteId: string) => {
      commitRunTestSuite({
        variables: {
          testSuiteId,
        },
      });
    },
    [commitRunTestSuite],
  );

  return [onRunTestSuite, isRunInFlight] as const;
}
