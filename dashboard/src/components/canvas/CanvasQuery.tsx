import { Divider } from '@fluentui/react-components';
import { faTrafficLight } from '@fortawesome/free-solid-svg-icons';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import { useRecoilState } from 'recoil';

import CanvasArrow from 'src/components/canvas/CanvasArrow';
import CanvasItem from 'src/components/canvas/CanvasItem';
import usePointerEvents from 'src/components/canvas/custom/usePointerEvents';
import Flexbox from 'src/components/custom/Flexbox';
import { DokkimiColors } from 'src/components/styles/colors';
import stylist from 'src/components/styles/stylist';
import { selectedNamespaceQueryAtom } from 'src/recoil/dashboard/dashboard.atoms';
import { Stylesheet } from 'src/types/Stylesheet';

import { CanvasQuery_namespace$key } from './__generated__/CanvasQuery_namespace.graphql';
import { CanvasQuery_queryHistory$key } from './__generated__/CanvasQuery_queryHistory.graphql';

type Props = {
  queryHistoryRef: CanvasQuery_queryHistory$key;
  namespaceRef: CanvasQuery_namespace$key;
};

export default function CanvasQuery({ queryHistoryRef, namespaceRef }: Props) {
  const [selectedQueryId, setSelectedQueryId] = useRecoilState(
    selectedNamespaceQueryAtom,
  );

  const pointerEvents = usePointerEvents();
  const [hoveredQuery, setHoveredQuery] = useState<string | null>(null);

  const queryHistory = useFragment(
    graphql`
      fragment CanvasQuery_queryHistory on QueryHistory {
        itemId
        displayName
        originItemId
        databaseItemId
        ...CanvasArrow_namespaceItem
        ...CanvasItem_namespaceItem
      }
    `,
    queryHistoryRef,
  );

  const namespace = useFragment(
    graphql`
      fragment CanvasQuery_namespace on Namespace {
        queries {
          queryId
          originItemId
          databaseItemId
          query
          timestamp
        }
        services {
          itemId
          ...CanvasArrow_namespaceItem
        }
        databases {
          itemId
          ...CanvasArrow_namespaceItem
        }
      }
    `,
    namespaceRef,
  );

  const queries = useMemo(() => {
    return namespace.queries
      .filter(query => {
        const { originItemId, databaseItemId } = query;
        return (
          queryHistory.originItemId === originItemId &&
          queryHistory.databaseItemId === databaseItemId
        );
      })
      .sort((a, b) => (dayjs(a.timestamp) > dayjs(b.timestamp) ? -1 : 1));
  }, [namespace, queryHistory]);

  if (!queries.length) {
    return null;
  }

  const [id1, id2] = queryHistory.displayName.split('-');
  const node1 = namespace.services.find(service => service.itemId === id1);
  const node2 = namespace.databases.find(database => database.itemId === id2);

  return (
    <>
      <CanvasItem
        namespaceItemRef={queryHistory}
        icon={faTrafficLight}
        showHealthIcon={false}
        displayName="Query History"
      >
        <Flexbox direction="column" style={styles.container}>
          <Flexbox
            alignItems="center"
            fullWidth
            gap={16}
            style={stylist([styles.header])}
          >
            <div style={styles.queryCol}>Query</div>
            <div style={styles.timeCol}>Time</div>
          </Flexbox>
          <Divider style={styles.divider} />
          <Flexbox
            direction="column"
            gap={4}
            style={stylist([styles.rowsContainer, { pointerEvents }])}
            onWheel={e => e.stopPropagation()}
          >
            {queries.map(({ queryId, query, timestamp }, index) => (
              <div
                key={index}
                onMouseEnter={() => setHoveredQuery(queryId)}
                onMouseLeave={() => {
                  if (hoveredQuery === queryId) {
                    setHoveredQuery(null);
                  }
                }}
                style={stylist([
                  styles.row,
                  { pointerEvents },
                  hoveredQuery === queryId || selectedQueryId === queryId
                    ? styles.hoveredRow
                    : {},
                ])}
              >
                <Flexbox
                  alignItems="center"
                  fullWidth
                  gap={16}
                  onClick={() => setSelectedQueryId(queryId)}
                >
                  <div style={styles.queryCell}>{query}</div>
                  <div style={styles.timeCell}>
                    {dayjs(timestamp).fromNow()}
                  </div>
                </Flexbox>
              </div>
            ))}
          </Flexbox>
        </Flexbox>
      </CanvasItem>
      {node1 && <CanvasArrow node1Ref={node1} node2Ref={queryHistory} />}
      {node2 && <CanvasArrow node1Ref={queryHistory} node2Ref={node2} />}
    </>
  );
}

const styles = {
  container: {
    maxHeight: 304,
    paddingBottom: 4,
    overflow: 'hidden',
    backgroundColor: DokkimiColors.blackBackgroundColor,
    borderRadius: 8,
  },
  header: {
    padding: '8px 16px',
    borderRadius: 4,
    border: '1px solid transparent',
  },
  divider: {
    marginTop: 2,
    marginBottom: 8,
  },
  queryCol: {
    width: 120,
    flexGrow: 1,
    flexShrink: 0,
    textAlign: 'start',
  },
  timeCol: {
    flexShrink: 0,
    width: 144,
    textAlign: 'end',
  },
  rowsContainer: {
    flexGrow: 1,
    overflowY: 'auto',
    maxHeight: 192,
  },
  row: {
    padding: '4px 16px',
    border: '1px solid transparent',
  },
  hoveredRow: {
    backgroundColor: DokkimiColors.secondaryBackgroundColor,
    border: `1px solid ${DokkimiColors.tertiaryBackgroundColor}`,
    borderRadius: 4,
    cursor: 'pointer',
  },
  queryCell: {
    width: 120,
    flexGrow: 1,
    flexShrink: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    textAlign: 'start',
  },
  timeCell: {
    flexGrow: 1,
    flexShrink: 0,
    width: 104,
    textAlign: 'end',
  },
} satisfies Stylesheet;
