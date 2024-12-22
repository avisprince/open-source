import {
  Button,
  Divider,
  Dropdown,
  Option,
  TabList,
} from '@fluentui/react-components';
import { useEffect } from 'react';
import { graphql, useFragment } from 'react-relay';
import { useNavigate, useParams } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';

import DokkimiAvatar from 'src/components/custom/DokkimiAvatar';
import Flexbox from 'src/components/custom/Flexbox';
import Icon from 'src/components/custom/Icon';
import { SidebarTabs } from 'src/components/dashboard/DashboardTabs';
import NewOrgModal from 'src/components/dashboard/layout/sidebar/NewOrgModal';
import TabWrapper from 'src/components/dashboard/layout/sidebar/TabWrapper';
import { Tabs } from 'src/components/dashboard/layout/sidebar/Tabs';
import { DokkimiColorsV2 } from 'src/components/styles/colors';
import useToggleState from 'src/hooks/useToggleState';
import { sessionAtom } from 'src/recoil/dashboard/dashboard.atoms';
import { Stylesheet } from 'src/types/Stylesheet';

import { Sidebar_user$key } from './__generated__/Sidebar_user.graphql';

type Props = {
  currUserRef: Sidebar_user$key;
};

export default function Sidebar({ currUserRef }: Props) {
  const { orgId, tab } = useParams();
  const setSession = useSetRecoilState(sessionAtom);
  const navigate = useNavigate();
  const [showModal, toggleShowModal] = useToggleState(false);

  const currentUser = useFragment(
    graphql`
      fragment Sidebar_user on User {
        ...NewOrgModal_user
        organizations {
          id
          name
          image
        }
      }
    `,
    currUserRef,
  );

  const onSelectTab = (tab: SidebarTabs) => {
    navigate(`/dashboard/${orgId}/${tab}`);
  };

  const onSelectOrg = (orgId: string) => {
    setSession(curr => ({
      ...curr,
      orgId,
    }));

    navigate(`/dashboard/${orgId}/${tab}`);
  };

  useEffect(() => {
    if (!Object.values(SidebarTabs).includes(tab as SidebarTabs)) {
      navigate(`/dashboard/${orgId}/${SidebarTabs.sandboxes}`);
    }
  }, [orgId, tab, navigate]);

  const currOrg = currentUser.organizations.find(org => org.id === orgId);

  if (!orgId) {
    return null;
  }

  return (
    <div style={styles.container}>
      <Flexbox direction="column" gap={8} style={styles.orgPicker}>
        <Flexbox alignItems="center" justifyContent="space-between">
          <div style={styles.orgHeader}>Organizations</div>
          <Button
            appearance="subtle"
            onClick={toggleShowModal}
            icon={<Icon name="plus" />}
          />
        </Flexbox>
        <Dropdown
          value={
            (
              <Flexbox alignItems="center" gap={8}>
                <DokkimiAvatar src={currOrg?.image} size={24} />
                <div>{currOrg?.name}</div>
              </Flexbox>
            ) as any // eslint-disable-line
          }
        >
          {currentUser.organizations.map(org => (
            <Option
              key={org.id}
              value={org.id}
              text={org.name}
              onClick={() => onSelectOrg(org.id)}
            >
              <Flexbox alignItems="center" gap={8}>
                <DokkimiAvatar src={org.image} size={24} />
                <div>{org.name}</div>
              </Flexbox>
            </Option>
          ))}
        </Dropdown>
      </Flexbox>
      <TabList vertical appearance="subtle" selectedValue={tab}>
        {Tabs.map((t, index) => {
          if (t.name === 'divider' || !t.tab) {
            return <Divider key={index} style={styles.divider} />;
          }

          return (
            <TabWrapper
              key={t.tab}
              value={t.tab}
              icon={t.icon}
              onClick={() => onSelectTab(t.tab)}
              isSelected={tab === t.tab}
            >
              {t.name}
            </TabWrapper>
          );
        })}
      </TabList>
      <NewOrgModal
        isOpen={showModal}
        onClose={toggleShowModal}
        currUserRef={currentUser}
      />
    </div>
  );
}

const styles = {
  container: {
    height: '100%',
    width: 320,
    backgroundColor: DokkimiColorsV2.blackSecondary,
  },
  divider: {
    margin: '12px 0',
  },
  homeSection: {
    padding: 20,
    cursor: 'pointer',
  },
  homeSectionIcon: {
    height: 32,
    width: 32,
    borderRadius: '50%',
    backgroundColor: DokkimiColorsV2.blackTertiary,
  },
  homeSectionText: {
    fontSize: 20,
  },
  orgPicker: {
    padding: 16,
  },
  orgSection: {
    flexGrow: 1,
    marginTop: 20,
    overflow: 'hidden',
  },
  orgHeader: {
    fontSize: 14,
    marginBottom: 8,
  },
  orgTabs: {
    overflowY: 'auto',
  },
} satisfies Stylesheet;
