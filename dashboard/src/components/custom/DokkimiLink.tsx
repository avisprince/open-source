import { ReactNode } from 'react';
import { createUseStyles } from 'react-jss';

import { DokkimiColorsV2 } from 'src/components/styles/colors';
import { emptyFunction } from 'src/util/util';

type Props = {
  children: ReactNode;
  onClick?: () => void;
};

export default function DokkimiLink({
  children,
  onClick = emptyFunction,
}: Props) {
  const styles = useStyles();

  return (
    <div className={styles.container} onClick={onClick}>
      {children}
    </div>
  );
}

const useStyles = createUseStyles({
  container: {
    padding: 8,
    cursor: 'pointer',

    '&:hover': {
      fontWeight: 'bold',
      backgroundColor: DokkimiColorsV2.blackQuaternary,
      borderRadius: 8,
    },
  },
});
