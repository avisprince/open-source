import { useCallback } from 'react';
import { graphql, useMutation } from 'react-relay';

import { useCreateOrganizationMutation } from './__generated__/useCreateOrganizationMutation.graphql';

export default function useCreateOrganization() {
  const [createOrg, isLoading] =
    useMutation<useCreateOrganizationMutation>(graphql`
      mutation useCreateOrganizationMutation(
        $name: String!
        $creatorEmail: String!
      ) {
        createOrganization(name: $name, creatorEmail: $creatorEmail) {
          id
          name
          image
        }
      }
    `);

  const onCreateOrg = useCallback(
    (
      name: string,
      creatorEmail: string,
      onCompleted?: (orgId: string) => void,
    ) => {
      createOrg({
        variables: {
          name,
          creatorEmail,
        },
        onCompleted: response => {
          onCompleted?.(response.createOrganization.id);
        },
        updater: store => {
          const root = store.getRoot();
          const currUser = root.getLinkedRecord('currentUser');
          const newOrg = store.getRootField('createOrganization');

          const userOrgs = currUser?.getLinkedRecords('organizations') ?? [];
          currUser?.setLinkedRecords([...userOrgs, newOrg], 'organizations');
        },
      });
    },
    [createOrg],
  );

  return [onCreateOrg, isLoading] as const;
}
