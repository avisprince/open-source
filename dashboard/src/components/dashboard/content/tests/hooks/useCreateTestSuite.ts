import { useCallback } from 'react';
import { useMutation } from 'react-relay';
import { useRecoilValue } from 'recoil';
import { graphql } from 'relay-runtime';

import { sessionAtom } from 'src/recoil/dashboard/dashboard.atoms';

import {
  TestSuiteInput,
  useCreateTestSuiteMutation,
} from './__generated__/useCreateTestSuiteMutation.graphql';

export default function useCreateTestSuite() {
  const { orgId } = useRecoilValue(sessionAtom);

  const [commitCreateTestSuite, isCreateInFlight] =
    useMutation<useCreateTestSuiteMutation>(graphql`
      mutation useCreateTestSuiteMutation(
        $organizationId: ID!
        $testSuite: TestSuiteInput!
      ) {
        createTestSuite(
          organizationId: $organizationId
          testSuite: $testSuite
        ) {
          id
          ...TestCard_testSuite
        }
      }
    `);

  const onNewTestSuite = useCallback(
    (testSuite: TestSuiteInput) => {
      commitCreateTestSuite({
        variables: {
          organizationId: orgId,
          testSuite,
        },
        updater: store => {
          const root = store.getRoot();
          const newTestSuite = store.getRootField('createTestSuite');

          const args = {
            organizationId: orgId,
          };

          const testSuites = root.getLinkedRecords('orgTestSuites', args) ?? [];
          const updatedTestSuites = [...testSuites, newTestSuite];
          root.setLinkedRecords(updatedTestSuites, 'orgTestSuites', args);
        },
      });
    },
    [commitCreateTestSuite, orgId],
  );

  return [onNewTestSuite, isCreateInFlight] as const;
}
