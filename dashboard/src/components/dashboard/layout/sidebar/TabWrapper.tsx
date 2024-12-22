import { Tab, TabProps } from '@fluentui/react-components';
import clsx from 'clsx';
import { createUseStyles } from 'react-jss';

import { DokkimiColorsV2 } from 'src/components/styles/colors';

type Props = {
  isSelected: boolean;
} & TabProps;

export default function TabWrapper(props: Props) {
  const styles = useStyles();

  return (
    <Tab
      className={clsx(styles.tab, { [styles.selectedTab]: props.isSelected })}
      {...props}
    />
  );
}

const useStyles = createUseStyles({
  tab: {
    margin: '0 4px',
    padding: '12px 0 12px 40px',
  },
  selectedTab: {
    backgroundColor: DokkimiColorsV2.blackQuaternary,
  },
});
