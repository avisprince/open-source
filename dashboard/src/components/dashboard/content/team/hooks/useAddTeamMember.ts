import { useCallback } from 'react';
import { graphql, useMutation } from 'react-relay';
import { useRecoilValue } from 'recoil';

import { useAddTeamMemberMutation } from 'src/components/dashboard/content/team/hooks/__generated__/useAddTeamMemberMutation.graphql';
import { sessionAtom } from 'src/recoil/dashboard/dashboard.atoms';

export default function useAddTeamMember() {
  const { orgId } = useRecoilValue(sessionAtom);

  const [addMember, isLoading] = useMutation<useAddTeamMemberMutation>(graphql`
    mutation useAddTeamMemberMutation($organizationId: ID!, $email: String!) {
      addMember(organizationId: $organizationId, email: $email) {
        ...Team_organization
      }
    }
  `);

  const onAddMember = useCallback(
    (email: string) => {
      addMember({
        variables: {
          organizationId: orgId,
          email,
        },
      });
    },
    [addMember, orgId],
  );

  return [onAddMember, isLoading] as const;
}
