import { useCallback } from 'react';
import { graphql, useMutation } from 'react-relay';
import { useRecoilValue } from 'recoil';

import { sessionAtom } from 'src/recoil/dashboard/dashboard.atoms';

import { useDeleteOrganizationMutation } from './__generated__/useDeleteOrganizationMutation.graphql';

export default function useDeleteOrganization() {
  const { orgId } = useRecoilValue(sessionAtom);

  const [deleteOrg, isLoading] =
    useMutation<useDeleteOrganizationMutation>(graphql`
      mutation useDeleteOrganizationMutation($organizationId: ID!) {
        deleteOrganization(organizationId: $organizationId) {
          id
        }
      }
    `);

  const onDeleteOrg = useCallback(
    (onCompleted?: (orgId: string) => void) => {
      deleteOrg({
        variables: {
          organizationId: orgId,
        },
        onCompleted: response => {
          onCompleted?.(response.deleteOrganization.id);
        },
        updater: store => {
          const root = store.getRoot();
          const currUser = root.getLinkedRecord('currentUser');

          const userOrgs = currUser?.getLinkedRecords('organizations') ?? [];
          currUser?.setLinkedRecords(
            userOrgs.filter(org => org.getValue('id') !== orgId),
            'organizations',
          );
        },
      });
    },
    [deleteOrg, orgId],
  );

  return [onDeleteOrg, isLoading] as const;
}
