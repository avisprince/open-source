import { useMemo } from 'react';
import { graphql, useSubscription } from 'react-relay';
import { useRecoilValue } from 'recoil';

import { sessionAtom } from 'src/recoil/dashboard/dashboard.atoms';

export default function useOrganizationUsageSubscription() {
  const { orgId } = useRecoilValue(sessionAtom);

  useSubscription(
    useMemo(
      () => ({
        subscription: graphql`
          subscription useOrganizationUsageSubscription($orgId: ID!) {
            organizationUsage(orgId: $orgId) {
              cpu
              memory
              timestamp
            }
          }
        `,
        variables: {
          orgId,
        },
        updater: store => {
          const organization = store.get(orgId);
          const orgUsage = store.getRootField('organizationUsage');

          const organizationUsage = organization?.getLinkedRecords('usage');
          organization?.setLinkedRecords(
            [orgUsage, ...(organizationUsage ?? [])],
            'usage',
          );
        },
      }),
      [orgId],
    ),
  );
}
