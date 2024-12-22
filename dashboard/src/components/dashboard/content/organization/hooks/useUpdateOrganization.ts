import { useCallback } from 'react';
import { graphql, useMutation } from 'react-relay';
import { useRecoilValue } from 'recoil';

import { sessionAtom } from 'src/recoil/dashboard/dashboard.atoms';

import {
  OrganizationInput,
  useUpdateOrganizationMutation,
} from './__generated__/useUpdateOrganizationMutation.graphql';

export default function useUpdateOrganization() {
  const { orgId } = useRecoilValue(sessionAtom);

  const [commitUpdateOrganization, isLoading] =
    useMutation<useUpdateOrganizationMutation>(graphql`
      mutation useUpdateOrganizationMutation(
        $organizationId: ID!
        $organization: OrganizationInput!
      ) {
        updateOrganization(
          organizationId: $organizationId
          organization: $organization
        ) {
          name
          image
        }
      }
    `);

  const onSave = useCallback(
    (organization: OrganizationInput) => {
      commitUpdateOrganization({
        variables: {
          organizationId: orgId,
          organization,
        },
      });
    },
    [commitUpdateOrganization, orgId],
  );

  return [onSave, isLoading] as const;
}
