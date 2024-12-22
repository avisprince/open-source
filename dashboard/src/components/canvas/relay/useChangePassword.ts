import { useCallback } from 'react';
import { useMutation } from 'react-relay';
import { graphql } from 'relay-runtime';

import { useChangePasswordMutation } from './__generated__/useChangePasswordMutation.graphql';

export default function useChangePassword(email: string, newPassword: string) {
  const [commitChangePassword, isChangeInFlight] =
    useMutation<useChangePasswordMutation>(graphql`
      mutation useChangePasswordMutation(
        $email: String!
        $newPassword: String!
      ) {
        changePassword(email: $email, newPassword: $newPassword)
      }
    `);

  const onChangePassword = useCallback(() => {
    return commitChangePassword({
      variables: {
        email,
        newPassword,
      },
    });
  }, [commitChangePassword, email, newPassword]);

  return [onChangePassword, isChangeInFlight] as const;
}
