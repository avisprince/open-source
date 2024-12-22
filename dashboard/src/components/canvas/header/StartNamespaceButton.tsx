import { Button, Spinner } from '@fluentui/react-components';
import { Play24Filled, Stop24Filled } from '@fluentui/react-icons';
import clsx from 'clsx';
import { useMemo } from 'react';
import { createUseStyles } from 'react-jss';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { useStartNamespace } from 'src/components/canvas/relay/useStartNamespace';
import { useTerminateNamespace } from 'src/components/canvas/relay/useTerminateNamespace';
import ConfirmModal from 'src/components/custom/ConfirmModal';
import Flexbox from 'src/components/custom/Flexbox';
import { DokkimiColorsV2 } from 'src/components/styles/colors';
import useToggleState from 'src/hooks/useToggleState';
import { emptyFunction } from 'src/util/util';

import { StartNamespaceButton_query$key } from './__generated__/StartNamespaceButton_query.graphql';

type Props = {
  queryRef: StartNamespaceButton_query$key;
};

export default function StartNamespaceButton({ queryRef }: Props) {
  const styles = useStyles();
  const { namespace, organization } = useFragment(
    graphql`
      fragment StartNamespaceButton_query on Query
      @argumentDefinitions(
        organizationId: { type: "ID!" }
        namespaceId: { type: "ID!" }
      ) {
        organization(organizationId: $organizationId) {
          allocatedResources {
            cpu
            memory
          }
          usage {
            cpu
            memory
          }
        }
        namespace(namespaceId: $namespaceId) {
          id
          name
          status
          services {
            maxResources {
              cpu
              memory
            }
          }
          databases {
            maxResources {
              cpu
              memory
            }
          }
        }
      }
    `,
    queryRef,
  );

  const [showModal, toggleModal] = useToggleState(false);
  const [startNamespace, startNamespaceLoading] = useStartNamespace();
  const [terminateNamespace] = useTerminateNamespace();

  const { services, databases } = namespace;
  const namespaceItemResources = useMemo(() => {
    return [...services, ...databases].reduce(
      (agg, item) => {
        return {
          cpu: agg.cpu + item.maxResources.cpu,
          memory: agg.memory + item.maxResources.memory,
        };
      },
      { cpu: 0, memory: 0 },
    );
  }, [services, databases]);

  const outOfResources = useMemo(() => {
    const { usage, allocatedResources } = organization;
    if (!allocatedResources) {
      return false;
    }

    if (!usage?.length) {
      return (
        namespaceItemResources.cpu >= allocatedResources.cpu ||
        namespaceItemResources.memory >= allocatedResources.memory
      );
    }

    return (
      usage[0].cpu + namespaceItemResources.cpu >= allocatedResources.cpu ||
      usage[0].memory + namespaceItemResources.memory >=
        allocatedResources.memory
    );
  }, [organization, namespaceItemResources]);

  const actionButtonIcon = useMemo(() => {
    if (startNamespaceLoading) {
      return <Spinner size="tiny" />;
    }

    switch (namespace.status) {
      case 'inactive': {
        return <Play24Filled />;
      }
      case 'active': {
        return <Stop24Filled />;
      }
      case 'terminating': {
        return <Spinner size="tiny" />;
      }
    }
  }, [startNamespaceLoading, namespace.status]);

  const onTriggerNamespace = () => {
    if (!namespace.id) {
      return;
    }

    if (namespace.status === 'inactive') {
      outOfResources ? toggleModal() : startNamespace();
    } else if (namespace.status === 'active') {
      terminateNamespace(namespace.id);
    }
  };

  const { cpu, memory } = namespaceItemResources;
  const { usage, allocatedResources } = organization;

  const inUseCPU = usage?.[0]?.cpu ?? 0;
  const inUseRAM = usage?.[0]?.memory ?? 0;
  const orgCPU = allocatedResources.cpu;
  const orgRAM = allocatedResources.memory;

  const columns = [
    {
      title: '',
      cpu: 'CPU',
      memory: 'RAM',
    },
    {
      title: namespace.name,
      cpu: `${cpu}m`,
      memory: `${memory}Mi`,
      cpuRed: cpu + inUseCPU >= orgCPU,
      ramRed: memory + inUseRAM >= orgRAM,
    },
    {
      title: 'In Use',
      cpu: `${inUseCPU}m`,
      memory: `${inUseRAM}Mi`,
    },
    {
      title: 'Reserved',
      cpu: `${orgCPU}m`,
      memory: `${orgRAM}Mi`,
    },
  ];

  return (
    <>
      <Button
        appearance="secondary"
        onClick={onTriggerNamespace}
        icon={actionButtonIcon}
        disabled={namespace.status === 'terminating'}
        className={styles.actionButton}
      />
      <ConfirmModal
        isOpen={showModal}
        toggle={toggleModal}
        onConfirm={emptyFunction}
        buttonText="Close"
        title="Not enough resources available!"
        subtitle={
          <Flexbox direction="column" gap={16}>
            <div>
              Starting this sandbox will cause you to exceed your resource
              limit.
            </div>
            <Flexbox alignItems="center" justifyContent="space-between">
              {columns.map((col, i) => (
                <Flexbox direction="column" alignItems="center" key={i} gap={8}>
                  <div className={styles.usageTitle}>{col.title}</div>
                  <div className={clsx({ [styles.red]: col.cpuRed })}>
                    {col.cpu}
                  </div>
                  <div className={clsx({ [styles.red]: col.ramRed })}>
                    {col.memory}
                  </div>
                </Flexbox>
              ))}
            </Flexbox>
          </Flexbox>
        }
      />
    </>
  );
}

const useStyles = createUseStyles({
  actionButton: {
    height: 52,
    minWidth: 52,
    border: 'none',
  },
  usageTitle: {
    height: 20,
    fontWeight: 'bold',
    textDecoration: 'underline',
  },
  red: {
    color: DokkimiColorsV2.accentPrimary,
  },
});
