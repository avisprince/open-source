import { useCallback } from 'react';
import { useMutation } from 'react-relay';
import { graphql } from 'relay-runtime';

import { useDeleteTestSuiteMutation } from './__generated__/useDeleteTestSuiteMutation.graphql';

export default function useDeleteTestSuite() {
  const [commitDeleteTestSuite, isDeletionInFlight] =
    useMutation<useDeleteTestSuiteMutation>(graphql`
      mutation useDeleteTestSuiteMutation($testSuiteId: ID!) {
        deleteTestSuite(testSuiteId: $testSuiteId) {
          id
          permissions {
            organizationId
          }
        }
      }
    `);

  const onDeleteTestSuite = useCallback(
    (testSuiteId: string) => {
      commitDeleteTestSuite({
        variables: {
          testSuiteId,
        },
        updater: store => {
          const root = store.getRoot();
          const testSuite = store.getRootField('deleteTestSuite');
          const testSuiteId = testSuite.getValue('id');

          const orgId = testSuite
            .getLinkedRecord('permissions')
            .getValue('organizationId');

          const args = { organizationId: orgId };

          const testSuites =
            root
              .getLinkedRecords('orgTestSuites', args)
              ?.filter(ns => ns.getValue('id') !== testSuiteId) ?? [];

          root.setLinkedRecords(testSuites, 'orgTestSuites', args);
        },
      });
    },
    [commitDeleteTestSuite],
  );

  return [onDeleteTestSuite, isDeletionInFlight] as const;
}
