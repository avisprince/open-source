import { Button, Input, Spinner, Tooltip } from '@fluentui/react-components';
import dayjs from 'dayjs';
import { Dictionary } from 'lodash';
import { useMemo, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { graphql, useFragment } from 'react-relay';

import useClearTrafficHistory from 'src/components/canvas/sidebar/hooks/useClearTrafficHistory';
import { ActionIdentifier } from 'src/components/canvas/sidebar/shared/types';
import { SelectActionMode } from 'src/components/canvas/sidebar/trafficHistory/CanvasSidebarTrafficHistoryActionRequest';
import CanvasSidebarTrafficHistorySection from 'src/components/canvas/sidebar/trafficHistory/CanvasSidebarTrafficHistorySection';
import ConfirmModal from 'src/components/custom/ConfirmModal';
import Flexbox from 'src/components/custom/Flexbox';
import Icon from 'src/components/custom/Icon';
import useToggleState from 'src/hooks/useToggleState';
import { emptyFunction } from 'src/util/util';

import {
  CanvasSidebarTrafficHistory_actions$data,
  CanvasSidebarTrafficHistory_actions$key,
} from './__generated__/CanvasSidebarTrafficHistory_actions.graphql';

type Props = {
  actionsRef: CanvasSidebarTrafficHistory_actions$key;
  selectedActionIdentifier: ActionIdentifier | null;
  onClickAction: (actionIdentifier: ActionIdentifier) => void;
  selectMode?: SelectActionMode;
  checkedActions?: Set<string>;
  onCheckAction?: (actionId: ActionIdentifier) => void;
  showHoverActions: boolean;
  showListActions?: boolean;
  disabledActions?: Set<string>;
};

export default function CanvasSidebarTrafficHistory({
  actionsRef,
  selectedActionIdentifier,
  onClickAction,
  selectMode = 'none',
  checkedActions = new Set(),
  onCheckAction = emptyFunction,
  showHoverActions,
  showListActions,
  disabledActions,
}: Props) {
  const styles = useStyles();
  const [filter, setFilter] = useState('');
  const [showConfirmModal, toggleConfirmModal] = useToggleState(false);
  const [clearTrafficHistory, isLoading] = useClearTrafficHistory();

  const actions = useFragment(
    graphql`
      fragment CanvasSidebarTrafficHistory_actions on Action
      @relay(plural: true) {
        __typename
        timestamp
        method
        targetDomain
        url
        status
        originDomain
        ...CanvasSidebarTrafficHistorySection_actions
      }
    `,
    actionsRef,
  );

  const datedActions = useMemo(() => {
    const lowercaseFilter = filter.toLocaleLowerCase();

    return actions
      .filter(action => {
        const request =
          `${action.method}${action.targetDomain}${action.url}`.toLocaleLowerCase();

        const response = `${action.status ?? ''}${action.originDomain}${
          action.url
        }`.toLocaleLowerCase();

        return (
          request.includes(lowercaseFilter) ||
          response.includes(lowercaseFilter)
        );
      })
      .reduce<Dictionary<CanvasSidebarTrafficHistory_actions$data>>(
        (agg, action) => {
          const timestamp = dayjs(action.timestamp).format('MMMM D, YYYY');
          return {
            ...agg,
            [timestamp]: (agg[timestamp] || []).concat(action),
          };
        },
        {},
      );
  }, [actions, filter]);

  return (
    <>
      <Flexbox direction="column" className={styles.container}>
        <Flexbox alignItems="center" gap={8}>
          <Input
            value={filter}
            onChange={e => setFilter(e.target.value)}
            placeholder="Search..."
            className={styles.filter}
          />
          {showListActions && (
            <Tooltip
              content="Clear History"
              relationship="label"
              positioning="after"
              hideDelay={0}
            >
              {isLoading ? (
                <Spinner size="extra-tiny" />
              ) : (
                <Button
                  appearance="subtle"
                  icon={<Icon name="historyClear" />}
                  onClick={toggleConfirmModal}
                />
              )}
            </Tooltip>
          )}
        </Flexbox>
        <div className={styles.content}>
          {Object.entries(datedActions).map(([timestamp, actions]) => {
            return (
              <CanvasSidebarTrafficHistorySection
                key={timestamp}
                actionsRef={actions}
                timestamp={timestamp}
                selectedActionIdentifier={selectedActionIdentifier}
                onClickAction={onClickAction}
                selectMode={selectMode}
                checkedActions={checkedActions}
                onCheckAction={onCheckAction}
                showHoverActions={showHoverActions}
                disabledActions={disabledActions}
              />
            );
          })}
        </div>
      </Flexbox>
      <ConfirmModal
        isOpen={showConfirmModal}
        toggle={toggleConfirmModal}
        title="Delete Traffic History"
        subtitle="Are you sure you want to delete the Traffic History? This cannot be undone!"
        buttonText="Delete"
        onConfirm={clearTrafficHistory}
      />
    </>
  );
}

const useStyles = createUseStyles({
  container: {
    height: '100%',
    padding: 12,
    overflow: 'hidden',
  },
  content: {
    marginTop: 8,
    overflowY: 'auto',
  },
  filter: {
    flexGrow: 1,
  },
});
