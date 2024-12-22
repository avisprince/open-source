import { useCallback } from 'react';
import { graphql, useMutation } from 'react-relay';
import { useRecoilValue } from 'recoil';

import { sessionAtom } from 'src/recoil/dashboard/dashboard.atoms';

export default function useRemoveTeamMember() {
  const { orgId } = useRecoilValue(sessionAtom);

  const [removeMember, isLoading] = useMutation(graphql`
    mutation useRemoveTeamMemberMutation(
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
    (email: string) => {
      removeMember({
        variables: {
          organizationId: orgId,
          email,
        },
      });
    },
    [removeMember, orgId],
  );

  return [onRemoveMember, isLoading] as const;
}
