import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import { useParams } from 'react-router-dom';

import { SidebarTabs } from 'src/components/dashboard/DashboardTabs';
import Connections from 'src/components/dashboard/content/connections/Connections';
import DatabaseFiles from 'src/components/dashboard/content/databaseFiles/DatabaseFiles';
import OrganizationProfile from 'src/components/dashboard/content/organization/OrganizationProfile';
import Sandboxes from 'src/components/dashboard/content/sandboxes/Sandboxes';
import Team from 'src/components/dashboard/content/team/Team';
import Templates from 'src/components/dashboard/content/templates/Templates';
import Tests from 'src/components/dashboard/content/tests/Tests';
import { DokkimiColorsV2 } from 'src/components/styles/colors';
import { Stylesheet } from 'src/types/Stylesheet';

import { Content_query$key } from './__generated__/Content_query.graphql';

type Props = {
  queryRef: Content_query$key;
};

export default function Content({ queryRef }: Props) {
  const { tab } = useParams();

  const data = useFragment(
    graphql`
      fragment Content_query on Query
      @argumentDefinitions(
        organizationId: { type: "ID!" }
        skipOrgQuery: { type: "Boolean!" }
      ) {
        ...Sandboxes_query
          @arguments(
            organizationId: $organizationId
            skipOrgQuery: $skipOrgQuery
          )
        ...Templates_query
          @arguments(
            organizationId: $organizationId
            skipOrgQuery: $skipOrgQuery
          )
        ...Tests_query
          @arguments(
            organizationId: $organizationId
            skipOrgQuery: $skipOrgQuery
          )
        ...Connections_query
          @arguments(
            organizationId: $organizationId
            skipOrgQuery: $skipOrgQuery
          )
        ...DatabaseFiles_query
          @arguments(
            organizationId: $organizationId
            skipOrgQuery: $skipOrgQuery
          )
        ...OrganizationProfile_query
          @arguments(
            organizationId: $organizationId
            skipOrgQuery: $skipOrgQuery
          )
        currentUser {
          ...Team_currentUser
        }
        organization(organizationId: $organizationId) @skip(if: $skipOrgQuery) {
          ...Team_organization
        }
      }
    `,
    queryRef,
  );

  const content = useMemo(() => {
    switch (tab) {
      case SidebarTabs.sandboxes: {
        return <Sandboxes queryRef={data} />;
      }
      case SidebarTabs.templates: {
        return <Templates queryRef={data} />;
      }
      case SidebarTabs.tests: {
        return <Tests queryRef={data} />;
      }
      case SidebarTabs.connections: {
        return <Connections queryRef={data} />;
      }
      case SidebarTabs.dbFiles: {
        return <DatabaseFiles queryRef={data} />;
      }
      case SidebarTabs.team: {
        return (
          <Team
            currentUserRef={data.currentUser}
            organizationRef={data.organization ?? null}
          />
        );
      }
      case SidebarTabs.organizationProfile: {
        return <OrganizationProfile queryRef={data} />;
      }
      default: {
        return <div>Not Implemented Yet!</div>;
      }
    }
  }, [tab, data]);

  return <div style={styles.container}>{content}</div>;
}

const styles = {
  container: {
    height: '100%',
    width: '100%',
    backgroundColor: DokkimiColorsV2.blackTertiary,
  },
} satisfies Stylesheet;
