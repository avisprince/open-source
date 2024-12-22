import { graphql, useFragment } from 'react-relay';

import Flexbox from 'src/components/custom/Flexbox';
import { DokkimiColors, DokkimiColorsV2 } from 'src/components/styles/colors';
import { Stylesheet } from 'src/types/Stylesheet';

import { NamespaceUsage_namespace$key } from './__generated__/NamespaceUsage_namespace.graphql';

type Props = {
  namespaceRef: NamespaceUsage_namespace$key;
};

export default function NamespaceUsage({ namespaceRef }: Props) {
  const { usage } = useFragment(
    graphql`
      fragment NamespaceUsage_namespace on Namespace {
        usage {
          cpu
          memory
        }
      }
    `,
    namespaceRef,
  );

  if (!usage) {
    return null;
  }

  return (
    <Flexbox alignItems="center" gap={16} style={styles.container}>
      <Flexbox alignItems="center" gap={8}>
        <div style={styles.cpuTitle}>CPU:</div>
        <div>{usage.cpu.toFixed(2)}m</div>
      </Flexbox>
      <Flexbox alignItems="center" gap={8}>
        <div style={styles.ramTitle}>RAM:</div>
        <div>{usage.memory.toFixed(2)}Mi</div>
      </Flexbox>
    </Flexbox>
  );
}

const styles = {
  container: {
    height: 52,
    padding: '0 16px',
    borderRadius: 4,
    backgroundColor: DokkimiColors.blackBackgroundColor,
  },
  cpuTitle: {
    fontWeight: 'bold',
    color: DokkimiColorsV2.cpuBlue,
  },
  ramTitle: {
    fontWeight: 'bold',
    color: DokkimiColorsV2.ramOrange,
  },
} satisfies Stylesheet;
