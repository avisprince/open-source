import { Tooltip } from '@fluentui/react-components';
import { IconDefinition } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import clsx from 'clsx';
import { createUseStyles } from 'react-jss';

import DokkimiTooltip from 'src/components/custom/DokkimiTooltip';
import Flexbox from 'src/components/custom/Flexbox';
import { DokkimiColorsV2 } from 'src/components/styles/colors';

type Props = {
  tooltip: string;
  icon: IconDefinition;
  onClick: () => void;
  isSelected?: boolean;
};

export default function CanvasSidebarTab({
  tooltip,
  icon,
  onClick,
  isSelected,
}: Props) {
  const styles = useStyles();

  return (
    <DokkimiTooltip
      content={tooltip}
      positioning="after"
      relationship="label"
      hideDelay={0}
    >
      <Flexbox
        alignItems="center"
        justifyContent="center"
        className={clsx(styles.tab, { [styles.selectedTab]: isSelected })}
        onClick={onClick}
      >
        <FontAwesomeIcon icon={icon} />
      </Flexbox>
    </DokkimiTooltip>
  );
}

const useStyles = createUseStyles({
  tab: {
    height: 40,
    width: 40,
    color: DokkimiColorsV2.offWhite,
    backgroundColor: DokkimiColorsV2.blackQuaternary,
    cursor: 'pointer',

    '&:hover': {
      color: DokkimiColorsV2.accentPrimary,
      backgroundColor: DokkimiColorsV2.blackQuaternary,
    },
  },
  selectedTab: {
    color: DokkimiColorsV2.accentPrimary,
    backgroundColor: DokkimiColorsV2.blackSecondary,
  },
});
