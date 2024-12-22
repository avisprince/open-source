import Spin from 'src/components/custom/Spin';
import { Stylesheet } from 'src/types/Stylesheet';

export default function Loading() {
  return (
    <div style={styles.container}>
      <div style={styles.title}>Loading...</div>
      <Spin />
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
  },
  title: {
    fontSize: 32,
    marginBottom: 20,
  },
} satisfies Stylesheet;
