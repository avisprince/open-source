import { Button, Divider } from '@fluentui/react-components';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { useMemo, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { graphql, useFragment } from 'react-relay';

import CanvasActionInfo from 'src/components/canvas/sidebar/shared/CanvasActionInfo';
import { ActionIdentifier } from 'src/components/canvas/sidebar/shared/types';
import CanvasSidebarTrafficHistory from 'src/components/canvas/sidebar/trafficHistory/CanvasSidebarTrafficHistory';
import { SelectActionMode } from 'src/components/canvas/sidebar/trafficHistory/CanvasSidebarTrafficHistoryActionRequest';
import DokkimiModal from 'src/components/custom/DokkimiModal';
import DokkimiModalTitle from 'src/components/custom/DokkimiModalTitle';
import Flexbox from 'src/components/custom/Flexbox';
import useSetState from 'src/hooks/useSetState';
import { emptyFunction } from 'src/util/util';

import { CanvasSidebarTrafficHistoryActionModal_actions$key } from './__generated__/CanvasSidebarTrafficHistoryActionModal_actions.graphql';

type OnSaveParams = {
  selectedAction: ActionIdentifier | null;
  checkedActions: Set<string>;
};

type Props = {
  actionsRef: CanvasSidebarTrafficHistoryActionModal_actions$key;
  isOpen: boolean;
  toggle: () => void;
  title: string;
  titleIcon: IconDefinition;
  initialActionIdentifier?: ActionIdentifier | null;
  onClickAction?: (actionIdentifier: ActionIdentifier) => void;
  selectMode?: SelectActionMode;
  initialCheckedActions?: Set<string>;
  onCheckAction?: (actionId: string) => void;
  showFooter?: boolean;
  onSave?: (saveParams: OnSaveParams) => void;
  onlyDokkimiActions?: boolean;
  hiddenActions?: Set<string>;
  disabledActions?: Set<string>;
  hideSidebar?: boolean;
  width?: number;
};

export default function CanvasSidebarTrafficHistoryActionModal({
  actionsRef,
  isOpen,
  toggle,
  title,
  titleIcon,
  initialActionIdentifier = null,
  onClickAction = emptyFunction,
  selectMode = 'none',
  initialCheckedActions = new Set(),
  onCheckAction = emptyFunction,
  showFooter,
  onSave = emptyFunction,
  onlyDokkimiActions,
  hiddenActions = new Set(),
  disabledActions = new Set(),
  hideSidebar = false,
  width = 1000,
}: Props) {
  const styles = useStyles();
  const [selectedActionIdentifier, setSelectedActionIdentifier] = useState(
    initialActionIdentifier,
  );
  const [checkedActions, setCheckedActions] = useSetState(
    initialCheckedActions,
  );

  const actions = useFragment(
    graphql`
      fragment CanvasSidebarTrafficHistoryActionModal_actions on Action
      @relay(plural: true) {
        id
        actionId
        type
        originDomain
        ...CanvasActionInfo_actionRequest
        ...CanvasActionInfo_actionResponse
        ...CanvasSidebarTrafficHistory_actions
      }
    `,
    actionsRef,
  );

  const [actionRequest, actionResponse] = useMemo(() => {
    const selectedActions = actions.filter(
      action => action.actionId === selectedActionIdentifier?.actionId,
    );

    return [
      selectedActions?.find(action => action.type === 'request') ?? null,
      selectedActions?.find(action => action.type === 'response') ?? null,
    ] as const;
  }, [selectedActionIdentifier, actions]);

  const filteredActions = useMemo(() => {
    const visibleActions = actions.filter(
      action => !hiddenActions.has(action.id),
    );

    if (onlyDokkimiActions) {
      return visibleActions.filter(
        action =>
          action.type === 'request' && action.originDomain === 'dokkimi',
      );
    }

    return visibleActions;
  }, [actions, hiddenActions, onlyDokkimiActions]);

  const onActionChecked = ({ id }: ActionIdentifier) => {
    onCheckAction(id);
    setCheckedActions(id);
  };

  const onSaveClick = () => {
    onSave({ selectedAction: selectedActionIdentifier, checkedActions });
    toggle();
  };

  return (
    <DokkimiModal
      isOpen={isOpen}
      toggle={toggle}
      showCloseButton
      width={width}
      showHeaderDivider
      title={<DokkimiModalTitle icon={titleIcon} title={title} />}
    >
      <Flexbox fullWidth style={{ height: 520 }}>
        {!hideSidebar && (
          <>
            <div className={styles.sidebar}>
              <CanvasSidebarTrafficHistory
                actionsRef={filteredActions}
                selectedActionIdentifier={selectedActionIdentifier}
                onClickAction={actionIdentifier => {
                  setSelectedActionIdentifier(actionIdentifier);
                  onClickAction(actionIdentifier);
                }}
                selectMode={selectMode}
                checkedActions={checkedActions}
                onCheckAction={onActionChecked}
                showHoverActions={false}
                disabledActions={disabledActions}
              />
            </div>
            <div>
              <Divider vertical className={styles.divider} />
            </div>
          </>
        )}
        <CanvasActionInfo
          actionIdentifier={selectedActionIdentifier}
          actionRequestRef={actionRequest}
          actionResponseRef={actionResponse}
        />
      </Flexbox>
      {showFooter && (
        <>
          <Divider />
          <Flexbox
            alignItems="center"
            justifyContent="end"
            className={styles.confirmButtons}
            gap={8}
          >
            <Button appearance="secondary" onClick={toggle}>
              Cancel
            </Button>
            <Button
              appearance="primary"
              onClick={onSaveClick}
              disabled={
                selectMode === 'multi' ? false : !selectedActionIdentifier
              }
            >
              Save
            </Button>
          </Flexbox>
        </>
      )}
    </DokkimiModal>
  );
}

const useStyles = createUseStyles({
  confirmButtons: {
    padding: 16,
  },
  divider: {
    height: '100%',
  },
  sidebar: {
    width: 300,
    flexShrink: 0,
    overflow: 'hidden',
  },
});
