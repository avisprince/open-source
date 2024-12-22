import { Divider } from '@fluentui/react-components';
import {
  IconDefinition,
  faFileLines,
  faHome,
  faTrafficLight,
  faVial,
  faWrench,
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';

import CanvasSidebarTab from 'src/components/canvas/sidebar/CanvasSidebarTab';
import Flexbox from 'src/components/custom/Flexbox';
import { DokkimiColorsV2 } from 'src/components/styles/colors';
import { selectedCanvasSidebarTabAtom } from 'src/recoil/dashboard/dashboard.atoms';
import { Stylesheet } from 'src/types/Stylesheet';

const tabs: { id: string; icon: IconDefinition }[] = [
  {
    id: 'Tools',
    icon: faWrench,
  },
  {
    id: 'Templates',
    icon: faFileLines,
  },
  {
    id: 'Traffic History',
    icon: faTrafficLight,
  },
  {
    id: 'Tests',
    icon: faVial,
  },
];

export default function CanvasSidebarTabs() {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useRecoilState(
    selectedCanvasSidebarTabAtom,
  );

  return (
    <Flexbox direction="column" style={styles.tabs}>
      <CanvasSidebarTab
        icon={faHome}
        tooltip="Home"
        onClick={() => navigate('/dashboard')}
      />
      <Divider />
      {tabs.map(tab => (
        <CanvasSidebarTab
          key={tab.id}
          tooltip={tab.id}
          icon={tab.icon}
          onClick={() =>
            setSelectedTab(curr => (curr?.id === tab.id ? null : tab))
          }
          isSelected={tab.id === selectedTab?.id}
        />
      ))}
    </Flexbox>
  );
}

const styles = {
  tabs: {
    borderBottomRightRadius: 8,
    backgroundColor: DokkimiColorsV2.blackSecondary,
    overflow: 'hidden',
  },
} satisfies Stylesheet;
