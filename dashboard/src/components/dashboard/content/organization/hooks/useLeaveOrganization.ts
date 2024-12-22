import { useCallback } from 'react';
import { graphql, useMutation } from 'react-relay';
import { useRecoilValue } from 'recoil';

import { sessionAtom } from 'src/recoil/dashboard/dashboard.atoms';

export default function useLeaveOrganization() {
  const { orgId } = useRecoilValue(sessionAtom);

  const [leaveOrg, isLoading] = useMutation(graphql`
    mutation useLeaveOrganizationMutation(
      $organizationId: ID!
      $email: String!
    ) {
      removeMember(organizationId: $organizationId, email: $email) {
        id
        members {
          ...TeamMemberCard_organizationMember
        }
      }
    }
  `);

  const onRemoveMember = useCallback(
    (email: string, onCompleted?: () => void) => {
      leaveOrg({
        variables: {
          organizationId: orgId,
          email,
        },
        onCompleted: () => {
          onCompleted?.();
        },
      });
    },
    [leaveOrg, orgId],
  );

  return [onRemoveMember, isLoading] as const;
}
