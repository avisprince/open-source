import { IconDefinition } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { createUseStyles } from 'react-jss';

import Flexbox from 'src/components/custom/Flexbox';

type Props = {
  icon?: IconDefinition;
  title: string;
};

export default function DokkimiModalTitle({ icon, title }: Props) {
  const styles = useStyles();

  return (
    <Flexbox alignItems="center" gap={16}>
      {icon && <FontAwesomeIcon icon={icon} size="lg" />}
      <div className={styles.title}>{title}</div>
    </Flexbox>
  );
}

const useStyles = createUseStyles({
  title: {
    fontSize: 16,
  },
});
