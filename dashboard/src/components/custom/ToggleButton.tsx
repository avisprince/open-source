import clsx from 'clsx';
import { createUseStyles } from 'react-jss';

import { DokkimiColors } from 'src/components/styles/colors';

type Props = {
  isSelected: boolean;
  onClick: () => void;
  text: string;
};

export default function ToggleButton({ isSelected, onClick, text }: Props) {
  const styles = useStyles();

  return (
    <div
      className={clsx(styles.tab, { [styles.selectedTab]: isSelected })}
      onClick={onClick}
    >
      {text}
    </div>
  );
}

const useStyles = createUseStyles({
  tab: {
    flexGrow: 1,
    marginBottom: 4,
    padding: '6px 4px',
    backgroundColor: DokkimiColors.defaultBackgroundColor,
    border: `1px solid ${DokkimiColors.tertiaryBackgroundColor}`,
    borderRadius: 4,
    textAlign: 'center',
    cursor: 'pointer',
    userSelect: 'none',
  },
  selectedTab: {
    backgroundColor: DokkimiColors.blackBackgroundColor,
    border: `1px solid ${DokkimiColors.blackBorderColor}`,
    borderBottomColor: DokkimiColors.accentBackgroundColor,
  },
});
