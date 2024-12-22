import { faTrafficLight } from '@fortawesome/free-solid-svg-icons';
import dayjs from 'dayjs';
import { useCallback, useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import { useRecoilState } from 'recoil';

import CanvasArrow from 'src/components/canvas/CanvasArrow';
import CanvasItem from 'src/components/canvas/CanvasItem';
import { CanvasTraffic_actions$key } from 'src/components/canvas/__generated__/CanvasTraffic_actions.graphql';
import usePointerEvents from 'src/components/canvas/custom/usePointerEvents';
import ActionRequestText from 'src/components/canvas/sidebar/shared/ActionRequestText';
import ActionResponseText from 'src/components/canvas/sidebar/shared/ActionResponseText';
import Flexbox from 'src/components/custom/Flexbox';
import Icon from 'src/components/custom/Icon';
import { DokkimiColors } from 'src/components/styles/colors';
import stylist from 'src/components/styles/stylist';
import {
  hoveredNamespaceActionAtom,
  selectedNamespaceActionAtom,
} from 'src/recoil/dashboard/dashboard.atoms';
import { Stylesheet } from 'src/types/Stylesheet';

import { CanvasTraffic_namespace$key } from './__generated__/CanvasTraffic_namespace.graphql';
import { CanvasTraffic_trafficHistory$key } from './__generated__/CanvasTraffic_trafficHistory.graphql';

type Props = {
  trafficHistoryRef: CanvasTraffic_trafficHistory$key;
  namespaceRef: CanvasTraffic_namespace$key;
};

export default function CanvasTraffic({
  trafficHistoryRef,
  namespaceRef,
}: Props) {
  const [selectedActionId, setSelectedActionId] = useRecoilState(
    selectedNamespaceActionAtom,
  );

  const pointerEvents = usePointerEvents();
  const [hoveredAction, setHoveredAction] = useRecoilState(
    hoveredNamespaceActionAtom,
  );

  const trafficHistory = useFragment(
    graphql`
      fragment CanvasTraffic_trafficHistory on TrafficHistory {
        itemId
        displayName
        ...CanvasArrow_namespaceItem
        ...CanvasItem_namespaceItem
      }
    `,
    trafficHistoryRef,
  );

  const namespace = useFragment(
    graphql`
      fragment CanvasTraffic_namespace on Namespace {
        actions {
          ...CanvasTraffic_actions
        }
        services {
          itemId
          domain
          displayName
          ...CanvasArrow_namespaceItem
        }
      }
    `,
    namespaceRef,
  );

  const actions = useFragment<CanvasTraffic_actions$key>(
    graphql`
      fragment CanvasTraffic_actions on Action @relay(plural: true) {
        id
        actionId
        timestamp
        type
        origin
        target
        ...ActionRequestText_action
        ...ActionResponseText_action
      }
    `,
    namespace.actions,
  );

  const filteredActions = useMemo(() => {
    return actions.filter(action => {
      return (
        trafficHistory.displayName === `${action.origin}-${action.target}` ||
        trafficHistory.displayName === `${action.target}-${action.origin}`
      );
    });
  }, [actions, trafficHistory]);

  const serviceDisplayName = useCallback(
    (itemId?: string) => {
      if (itemId === 'dokkimi') {
        return 'Dokkimi';
      }

      const service = namespace.services.find(
        service => service.itemId === itemId || service.domain === itemId,
      );
      return service?.displayName ?? itemId;
    },
    [namespace.services],
  );

  const displayNames = useMemo(() => {
    const [id1, id2] = trafficHistory.displayName.split('-');
    return [serviceDisplayName(id1), serviceDisplayName(id2)];
  }, [trafficHistory.displayName, serviceDisplayName]);

  if (filteredActions.length === 0) {
    return null;
  }

  const [id1, id2] = trafficHistory.displayName.split('-');
  const node1 = namespace.services.find(service => service.itemId === id1);
  const node2 = namespace.services.find(service => service.itemId === id2);

  return (
    <>
      <CanvasItem
        namespaceItemRef={trafficHistory}
        icon={faTrafficLight}
        showHealthIcon={false}
        displayName={
          <Flexbox alignItems="center" gap={4} style={styles.displayName}>
            <div>{displayNames[0]}</div>
            <Icon name="arrowLeftRight" size={20} />
            <div>{displayNames[1]}</div>
          </Flexbox>
        }
      >
        <Flexbox direction="column" style={styles.container}>
          <Flexbox
            direction="column"
            gap={4}
            style={stylist([styles.rowsContainer, { pointerEvents }])}
            onWheel={e => e.stopPropagation()}
          >
            {filteredActions.map((action, index) => (
              <div
                key={index}
                onMouseEnter={() => setHoveredAction(action.actionId)}
                onMouseLeave={() => {
                  if (hoveredAction === action.actionId) {
                    setHoveredAction(null);
                  }
                }}
                style={stylist([
                  styles.row,
                  { pointerEvents },
                  hoveredAction === action.actionId ||
                  selectedActionId?.actionId === action.actionId
                    ? styles.hoveredRow
                    : {},
                ])}
              >
                <Flexbox
                  alignItems="center"
                  justifyContent="space-between"
                  fullWidth
                  gap={16}
                  onClick={() =>
                    setSelectedActionId({
                      id: action.id,
                      actionId: action.actionId,
                    })
                  }
                >
                  {action.type === 'request' ? (
                    <ActionRequestText actionRef={action} />
                  ) : (
                    <ActionResponseText actionRef={action} />
                  )}
                  <div style={styles.timeCell}>
                    {dayjs(action.timestamp).fromNow()}
                  </div>
                </Flexbox>
              </div>
            ))}
          </Flexbox>
        </Flexbox>
      </CanvasItem>
      {node1 && <CanvasArrow node1Ref={trafficHistory} node2Ref={node1} />}
      {node2 && <CanvasArrow node1Ref={trafficHistory} node2Ref={node2} />}
    </>
  );
}

const styles = {
  container: {
    maxHeight: 300,
    paddingBottom: 4,
    overflow: 'hidden',
    backgroundColor: DokkimiColors.blackBackgroundColor,
    borderRadius: 8,
  },
  displayName: {
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  rowsContainer: {
    flexGrow: 1,
    overflowY: 'auto',
    maxHeight: 192,
    padding: '4px 8px',
  },
  row: {
    padding: 4,
    border: '1px solid transparent',
    borderRadius: 8,
  },
  hoveredRow: {
    backgroundColor: DokkimiColors.secondaryBackgroundColor,
    border: `1px solid ${DokkimiColors.tertiaryBackgroundColor}`,
    borderRadius: 4,
    cursor: 'pointer',
  },
  timeCell: {
    flexGrow: 1,
    flexShrink: 0,
    width: 140,
    textAlign: 'end',
  },
} satisfies Stylesheet;
