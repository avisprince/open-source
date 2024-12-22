import { Spinner } from '@fluentui/react-components';
import {
  CheckmarkCircle20Filled,
  DismissCircle20Filled,
} from '@fluentui/react-icons';
import { useMemo } from 'react';
import { createUseStyles } from 'react-jss';
import { graphql, useFragment } from 'react-relay';
import { useNavigate } from 'react-router-dom';

import Flexbox from 'src/components/custom/Flexbox';
import SandboxCardPreview from 'src/components/dashboard/content/sandboxes/SandboxCardPreview';
import { DokkimiColorsV2 } from 'src/components/styles/colors';

import { SandboxCard_namespace$key } from './__generated__/SandboxCard_namespace.graphql';

type Props = {
  namespaceRef: SandboxCard_namespace$key;
};

export default function SandboxCard({ namespaceRef }: Props) {
  const styles = useStyles();
  const navigate = useNavigate();
  const namespace = useFragment(
    graphql`
      fragment SandboxCard_namespace on Namespace {
        id
        name
        status
        usage {
          cpu
          memory
        }
        ...SandboxCardPreview_namespace
      }
    `,
    namespaceRef,
  );

  const statusIcon = useMemo(() => {
    switch (namespace.status) {
      case 'active': {
        return (
          <CheckmarkCircle20Filled
            color={DokkimiColorsV2.greenSuccess}
            className={styles.statusIcon}
          />
        );
      }
      case 'inactive': {
        return (
          <DismissCircle20Filled
            color={DokkimiColorsV2.greyInactive}
            className={styles.statusIcon}
          />
        );
      }
      case 'terminating': {
        return <Spinner size="extra-tiny" />;
      }
      default: {
        return null;
      }
    }
  }, [namespace.status, styles]);

  return (
    <Flexbox
      alignItems="center"
      justifyContent="center"
      direction="column"
      className={styles.container}
      onClick={() => navigate(`/sandboxes/${namespace.id}`)}
    >
      <SandboxCardPreview namespaceRef={namespace} />
      <Flexbox direction="column" gap={8} grow={1} className={styles.metadata}>
        <div className={styles.title}>{namespace.name}</div>
        <Flexbox alignItems="center" justifyContent="space-between">
          <Flexbox alignItems="center" gap={8}>
            {statusIcon}
            <div className={styles.statusText}>{namespace.status}</div>
          </Flexbox>
          {namespace.status === 'active' && namespace.usage && (
            <Flexbox alignItems="center" gap={16}>
              <Flexbox alignItems="center" gap={8}>
                <div className={styles.cpuTitle}>CPU:</div>{' '}
                <div>{namespace.usage.cpu.toFixed(2)}m</div>
              </Flexbox>
              <Flexbox alignItems="center" gap={8}>
                <div className={styles.ramTitle}>RAM:</div>{' '}
                <div>{namespace.usage.memory.toFixed(2)}Mi</div>
              </Flexbox>
            </Flexbox>
          )}
        </Flexbox>
      </Flexbox>
    </Flexbox>
  );
}

const useStyles = createUseStyles({
  container: {
    height: 304,
    width: 352,
    borderRadius: 8,
    border: '1px solid #434343',
    backgroundColor: DokkimiColorsV2.blackQuaternary,
    cursor: 'pointer',
    overflow: 'hidden',

    '&:hover': {
      borderColor: DokkimiColorsV2.accentPrimary,
    },
  },
  metadata: {
    width: '100%',
    padding: 16,
  },
  statusIcon: {
    flexShrink: 0,
  },
  statusText: {
    textTransform: 'capitalize',
  },
  title: {
    fontSize: 16,
  },
  cpuTitle: {
    color: DokkimiColorsV2.cpuBlue,
    fontSize: 16,
  },
  ramTitle: {
    color: DokkimiColorsV2.ramOrange,
    fontSize: 16,
  },
});
