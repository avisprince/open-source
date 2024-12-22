import { useEffect } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { useNavigate, useParams } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';

import Flexbox from 'src/components/custom/Flexbox';
import { SidebarTabs } from 'src/components/dashboard/DashboardTabs';
import Content from 'src/components/dashboard/layout/Content';
import Header from 'src/components/dashboard/layout/Header';
import Sidebar from 'src/components/dashboard/layout/Sidebar';
import useDashboardSubscriptions from 'src/components/dashboard/subscriptions/useDashboardSubscriptions';
import { sessionAtom } from 'src/recoil/dashboard/dashboard.atoms';
import { Stylesheet } from 'src/types/Stylesheet';

import { DashboardQuery } from './__generated__/DashboardQuery.graphql';

export default function Dashboard() {
  const setSession = useSetRecoilState(sessionAtom);
  const { tab, orgId } = useParams();
  const navigate = useNavigate();

  const data = useLazyLoadQuery<DashboardQuery>(
    graphql`
      query DashboardQuery($organizationId: ID!, $skipOrgQuery: Boolean!) {
        currentUser {
          ...Header_user
          ...Sidebar_user
          organizations {
            id
          }
        }
        ...Content_query
          @arguments(
            organizationId: $organizationId
            skipOrgQuery: $skipOrgQuery
          )
      }
    `,
    {
      organizationId: orgId ?? '',
      skipOrgQuery: !orgId,
    },
  );

  useEffect(() => {
    const personalOrg = data.currentUser.organizations[0];
    const selectedOrg = data.currentUser.organizations.find(
      org => org.id === orgId,
    );

    if (!selectedOrg) {
      navigate(`/dashboard/${personalOrg.id}/${tab ?? SidebarTabs.sandboxes}`);
      return;
    }

    setSession(prev => ({
      ...prev,
      namespaceId: '',
      orgId: selectedOrg.id,
    }));
  }, [orgId, tab, data.currentUser, navigate, setSession]);

  useDashboardSubscriptions();

  return (
    <Flexbox direction="column" style={styles.container}>
      <Header userRef={data.currentUser} />
      <Flexbox style={styles.content}>
        <Sidebar currUserRef={data.currentUser} />
        <Content queryRef={data} />
      </Flexbox>
    </Flexbox>
  );
}

const styles = {
  container: {
    height: '100%',
    width: '100%',
  },
  content: {
    flexGrow: 1,
    overflow: 'hidden',
  },
} satisfies Stylesheet;
