import { graphql, useMutation } from 'react-relay';
import { useRecoilValue } from 'recoil';

import { useResendActionMutation } from 'src/components/canvas/sidebar/hooks/__generated__/useResendActionMutation.graphql';
import { sessionAtom } from 'src/recoil/dashboard/dashboard.atoms';

export default function useResendAction() {
  const { namespaceId } = useRecoilValue(sessionAtom);

  const [commitResendNamespaceAction, isLoading] =
    useMutation<useResendActionMutation>(graphql`
      mutation useResendActionMutation(
        $namespaceId: ID!
        $actionRequestId: String!
      ) {
        resendNamespaceAction(
          namespaceId: $namespaceId
          actionRequestId: $actionRequestId
        ) {
          status
          data
          headers
        }
      }
    `);

  const resendAction = (actionRequestId: string) => {
    commitResendNamespaceAction({
      variables: {
        namespaceId,
        actionRequestId,
      },
    });
  };

  return [resendAction, isLoading] as const;
}
