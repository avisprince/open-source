import { Button, Input } from '@fluentui/react-components';
import { useEffect, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import { useNavigate, useParams } from 'react-router-dom';

import Flexbox from 'src/components/custom/Flexbox';
import OrganizationProfileChangeLogo from 'src/components/dashboard/content/organization/OrganizationProfileChangeLogo';
import OrganizationProfileDeleteButton from 'src/components/dashboard/content/organization/OrganizationProfileDeleteButton';
import OrganizationProfileLeaveButton from 'src/components/dashboard/content/organization/OrganizationProfileLeaveButton';
import OrganizationResources from 'src/components/dashboard/content/organization/OrganizationResources';
import OrganizationUsage from 'src/components/dashboard/content/organization/OrganizationUsage';
import useUpdateOrganization from 'src/components/dashboard/content/organization/hooks/useUpdateOrganization';
import ContentLayout from 'src/components/dashboard/layout/content/ContentLayout';
import { Stylesheet } from 'src/types/Stylesheet';

import { OrganizationProfile_query$key } from './__generated__/OrganizationProfile_query.graphql';

type Props = {
  queryRef: OrganizationProfile_query$key;
};

export default function OrganizationProfile({ queryRef }: Props) {
  const navigate = useNavigate();
  const { orgId, tab } = useParams();

  const { currentUser, organization } = useFragment(
    graphql`
      fragment OrganizationProfile_query on Query
      @argumentDefinitions(
        organizationId: { type: "ID!" }
        skipOrgQuery: { type: "Boolean!" }
      ) {
        currentUser {
          id
          email
          organizations {
            id
          }
        }
        organization(organizationId: $organizationId) @skip(if: $skipOrgQuery) {
          name
          isPersonal
          owner
          ...OrganizationResources_organization
          ...OrganizationUsage_organization
          ...OrganizationProfileChangeLogo_organization
        }
      }
    `,
    queryRef,
  );

  const [nameInput, setNameInput] = useState(organization?.name ?? '');
  const [updateOrg] = useUpdateOrganization();

  useEffect(() => {
    setNameInput(organization?.name ?? '');
  }, [organization?.name]);

  const onConfirmClick = () => {
    updateOrg({ name: nameInput });
  };

  const onLeaveOrg = () => {
    const newOrgId = currentUser.organizations.find(org => org.id !== orgId);
    navigate(`/dashboard/${newOrgId}/${tab}`, { replace: true });
  };

  const isOwner = organization?.owner === currentUser.id;

  return (
    <ContentLayout title="Organization Profile">
      <Flexbox direction="column" gap={20} style={styles.page}>
        <div style={styles.container}>
          <Flexbox justifyContent="space-between">
            <Flexbox justifyContent="center" direction="column" grow={1}>
              <div style={styles.changeNameInputLabel}>Team name</div>
              <Input
                placeholder="Organization name"
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                style={styles.changeNameInput}
              />
              <div style={styles.changeNameButton}>
                <Button
                  appearance="primary"
                  onClick={onConfirmClick}
                  disabled={!nameInput}
                >
                  Confirm changes
                </Button>
              </div>
            </Flexbox>
            <OrganizationProfileChangeLogo
              organizationRef={organization ?? null}
            />
          </Flexbox>
        </div>
        <div style={styles.container}>
          <OrganizationResources organizationRef={organization ?? null} />
        </div>
        <div style={styles.container}>
          <OrganizationUsage organizationRef={organization ?? null} />
        </div>
        {!organization?.isPersonal && (
          <div style={styles.container}>
            <Flexbox alignItems="center" justifyContent="end" gap={20}>
              {!isOwner && (
                <OrganizationProfileLeaveButton
                  email={currentUser.email}
                  onLeave={onLeaveOrg}
                />
              )}
              {isOwner && (
                <OrganizationProfileDeleteButton onDelete={onLeaveOrg} />
              )}
            </Flexbox>
          </div>
        )}
      </Flexbox>
    </ContentLayout>
  );
}

const styles = {
  container: {
    padding: 24,
    border:
      '1px solid var(--dark-elevation-circle-border, rgba(255, 255, 255, 0.09))',
    borderRadius: 8,
  },
  changeNameButton: {
    marginTop: 32,
  },
  changeNameInput: {
    width: '100%',
  },
  changeNameInputLabel: {
    marginBottom: 8,
  },
  page: {
    overflow: 'auto',
  },
} satisfies Stylesheet;
