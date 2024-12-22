import {
  Popover,
  PopoverSurface,
  PopoverTrigger,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@fluentui/react-components';
import { ChevronUpDown16Filled } from '@fluentui/react-icons';
import { useMemo } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import CanvasDetailsHealthIcon from 'src/components/canvas/itemDetails/CanvasDetailsHealthIcon';
import Flexbox from 'src/components/custom/Flexbox';
import { DokkimiColors } from 'src/components/styles/colors';
import 'src/types/Canvas';
import { Stylesheet } from 'src/types/Stylesheet';

import { ItemStatusMenuItem_namespace$key } from './__generated__/ItemStatusMenuItem_namespace.graphql';

type Props = {
  namespaceRef: ItemStatusMenuItem_namespace$key;
};

export default function ItemStatusMenu({ namespaceRef }: Props) {
  const namespace = useFragment(
    graphql`
      fragment ItemStatusMenuItem_namespace on Namespace {
        items {
          itemId
          itemType
          displayName
          namespaceStatus
          usage {
            cpu
            memory
          }
        }
        usage {
          cpu
          memory
        }
      }
    `,
    namespaceRef,
  );

  const items = useMemo(() => {
    return namespace.items.filter(
      item =>
        item.namespaceStatus && ['Service', 'Database'].includes(item.itemType),
    );
  }, [namespace]);

  const statusText = useMemo(() => {
    const statuses = items.reduce<Record<string, number>>(
      (acc, { namespaceStatus }) => {
        if (!namespaceStatus) {
          return acc;
        }

        return {
          ...acc,
          [namespaceStatus]: (acc[namespaceStatus] || 0) + 1,
        };
      },
      {},
    );

    if (statuses['crashed']) {
      return {
        status: 'crashed',
        text: `${statuses['crashed']} / ${items.length} - Crashed`,
      };
    }

    if (statuses['loading']) {
      return {
        status: 'loading',
        text: `${statuses['loading']} / ${items.length} - Loading`,
      };
    }

    return {
      status: 'running',
      text: `${items.length} / ${items.length} - Healthy`,
    };
  }, [items]);

  const cpuLabel = namespace.usage
    ? `CPU - ${namespace.usage.cpu.toFixed(2)}m`
    : 'CPU';
  const ramLabel = namespace.usage
    ? `RAM - ${namespace.usage.memory.toFixed(2)}Mi`
    : 'RAM';

  const columns = [
    { key: 'service', label: '' },
    { key: 'cpu', label: cpuLabel },
    { key: 'ram', label: ramLabel },
  ];

  return (
    <Popover>
      <PopoverTrigger>
        <div>
          <Flexbox alignItems="center" style={styles.container} gap={8}>
            <CanvasDetailsHealthIcon namespaceStatus={statusText.status} />
            <div>{statusText.text}</div>
            <ChevronUpDown16Filled style={{ flexShrink: 0 }} />
          </Flexbox>
        </div>
      </PopoverTrigger>
      <PopoverSurface>
        <div style={{ width: 500 }}>
          <Table size="small">
            <TableHeader>
              <TableRow>
                {columns.map(({ key, label }) => (
                  <TableCell key={key}>
                    <Flexbox
                      justifyContent="end"
                      style={{ fontWeight: 'bold' }}
                    >
                      {label}
                    </Flexbox>
                  </TableCell>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map(item => (
                <TableRow key={item.itemId}>
                  <TableCell>
                    <Flexbox alignItems="center" gap={8}>
                      <CanvasDetailsHealthIcon
                        namespaceStatus={item.namespaceStatus}
                      />
                      <div style={styles.itemText}>{item.displayName}</div>
                    </Flexbox>
                  </TableCell>
                  <TableCell>
                    <Flexbox justifyContent="end">
                      {item.usage ? `${item.usage.cpu.toFixed(2)}m` : '-'}
                    </Flexbox>
                  </TableCell>
                  <TableCell>
                    <Flexbox justifyContent="end">
                      {item.usage ? `${item.usage.memory.toFixed(2)}Mi` : '-'}
                    </Flexbox>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </PopoverSurface>
    </Popover>
  );
}

const styles = {
  container: {
    height: 52,
    padding: '0 12px 0 8px',
    borderRadius: 4,
    backgroundColor: DokkimiColors.blackBackgroundColor,
  },
  itemText: {
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
} satisfies Stylesheet;
