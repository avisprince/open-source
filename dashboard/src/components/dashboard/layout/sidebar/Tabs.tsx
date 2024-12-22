import Icon from 'src/components/custom/Icon';
import { SidebarTabs } from 'src/components/dashboard/DashboardTabs';

export const Tabs = [
  {
    name: 'Sandboxes',
    tab: SidebarTabs.sandboxes,
    icon: <Icon name="box" />,
  },
  {
    name: 'Templates',
    tab: SidebarTabs.templates,
    icon: <Icon name="doc" />,
  },
  {
    name: 'Tests',
    tab: SidebarTabs.tests,
    icon: <Icon name="chart" />,
  },
  {
    name: 'Divider',
  },
  {
    name: 'Organization Profile',
    tab: SidebarTabs.organizationProfile,
    icon: <Icon name="personSquare" />,
  },
  {
    name: 'Team Members',
    tab: SidebarTabs.team,
    icon: <Icon name="team" />,
  },
  {
    name: 'Connections',
    tab: SidebarTabs.connections,
    icon: <Icon name="plugConnected" />,
  },
  {
    name: 'Database Files',
    tab: SidebarTabs.dbFiles,
    icon: <Icon name="documentDatabase" />,
  },
  // {
  //   name: 'Settings',
  //   tab: SidebarTabs.settings,
  //   icon: <Icon name="settings" />,
  // },
];
