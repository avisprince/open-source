import { useCallback } from 'react';
import { useMutation } from 'react-relay';
import { useRecoilValue } from 'recoil';
import { graphql } from 'relay-runtime';

import { sessionAtom } from 'src/recoil/dashboard/dashboard.atoms';

import { useCreateNamespaceMutation } from './__generated__/useCreateNamespaceMutation.graphql';

export default function useCreateNamespace() {
  const { orgId } = useRecoilValue(sessionAtom);

  const [commitCreateNamespace, isCreateInFlight] =
    useMutation<useCreateNamespaceMutation>(graphql`
      mutation useCreateNamespaceMutation(
        $organizationId: ID!
        $name: String!
      ) {
        createNamespace(
          organizationId: $organizationId
          namespace: { name: $name, type: "sandbox" }
        ) {
          id
          ...SelectNamespaceMenu_namespace
          ...SandboxCard_namespace
        }
      }
    `);

  const onCreateNamespace = useCallback(
    (name: string, onCompleted?: (createdNamespaceId: string) => void) => {
      commitCreateNamespace({
        variables: {
          organizationId: orgId,
          name,
        },
        onCompleted: ({ createNamespace }) => {
          if (onCompleted) {
            onCompleted(createNamespace.id);
          }
        },
        updater: store => {
          const root = store.getRoot();
          const newNamespace = store.getRootField('createNamespace');

          const args = {
            organizationId: orgId,
            type: 'sandbox',
          };

          const namespaces = root.getLinkedRecords('namespaces', args) ?? [];
          const updatedNamespaces = [...namespaces, newNamespace];
          root.setLinkedRecords(updatedNamespaces, 'namespaces', args);

          const userNamespaces = root.getLinkedRecords('userNamespaces') ?? [];
          const updatedUserNamespaces = [...userNamespaces, newNamespace];
          root.setLinkedRecords(updatedUserNamespaces, 'userNamespaces');
        },
      });
    },
    [commitCreateNamespace, orgId],
  );

  return [onCreateNamespace, isCreateInFlight] as const;
}
