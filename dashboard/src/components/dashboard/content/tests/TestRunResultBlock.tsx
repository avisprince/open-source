import clsx from 'clsx';
import { createUseStyles } from 'react-jss';

import DokkimiTooltip from 'src/components/custom/DokkimiTooltip';
import { DokkimiColorsV2 } from 'src/components/styles/colors';

type Props = {
  success?: boolean;
  tooltip: string;
  onClick?: () => void;
};

export default function TestRunResultBlock({
  success,
  tooltip,
  onClick,
}: Props) {
  const styles = useStyles();

  if (success === undefined) {
    return (
      <DokkimiTooltip
        content="Did not run"
        positioning="above"
        relationship="label"
        hideDelay={0}
      >
        <div className={clsx(styles.testRunBlock, styles.emptyBlock)} />
      </DokkimiTooltip>
    );
  }

  return (
    <DokkimiTooltip
      content={tooltip}
      positioning="above"
      relationship="label"
      hideDelay={0}
    >
      <div
        className={clsx(styles.testRunBlock, {
          [styles.successBlock]: success === true,
          [styles.failBlock]: success === false,
          [styles.cursorPointer]: !!onClick,
        })}
        onClick={() => onClick?.()}
      />
    </DokkimiTooltip>
  );
}

const useStyles = createUseStyles({
  testRunBlock: {
    height: 24,
    width: 12,
  },
  successBlock: {
    backgroundColor: DokkimiColorsV2.greenSuccess,
  },
  failBlock: {
    backgroundColor: DokkimiColorsV2.accentPrimary,
  },
  emptyBlock: {
    backgroundColor: DokkimiColorsV2.greyInactive,
    cursor: 'default',
  },
  cursorPointer: {
    cursor: 'pointer',
  },
});
