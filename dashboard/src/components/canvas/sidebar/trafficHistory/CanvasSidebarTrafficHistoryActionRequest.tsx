import { Button, Checkbox, Spinner } from '@fluentui/react-components';
import clsx from 'clsx';
import { createUseStyles } from 'react-jss';
import { graphql, useFragment } from 'react-relay';
import { useRecoilState, useSetRecoilState } from 'recoil';

import useResendAction from 'src/components/canvas/sidebar/hooks/useResendAction';
import ActionRequestText from 'src/components/canvas/sidebar/shared/ActionRequestText';
import { ActionIdentifier } from 'src/components/canvas/sidebar/shared/types';
import DokkimiTooltip from 'src/components/custom/DokkimiTooltip';
import Flexbox from 'src/components/custom/Flexbox';
import Icon from 'src/components/custom/Icon';
import { DokkimiColorsV2 } from 'src/components/styles/colors';
import {
  hoveredCanvasItemAtom,
  hoveredNamespaceActionAtom,
} from 'src/recoil/dashboard/dashboard.atoms';
import { emptyFunction } from 'src/util/util';

import { CanvasSidebarTrafficHistoryActionRequest_action$key } from './__generated__/CanvasSidebarTrafficHistoryActionRequest_action.graphql';

export type SelectActionMode = 'none' | 'single' | 'multi';

type Props = {
  actionRef: CanvasSidebarTrafficHistoryActionRequest_action$key;
  selectedActionIdentifier: ActionIdentifier | null;
  onClickAction: (actionIdentifier: ActionIdentifier) => void;
  selectMode?: SelectActionMode;
  isChecked?: boolean;
  onCheckAction?: (actionId: ActionIdentifier) => void;
  showHoverActions: boolean;
  isDisabled?: boolean;
};

export default function CanvasSidebarTrafficHistoryActionRequest({
  actionRef,
  selectedActionIdentifier,
  onClickAction,
  selectMode = 'none',
  isChecked,
  onCheckAction = emptyFunction,
  showHoverActions,
  isDisabled,
}: Props) {
  const styles = useStyles();
  const [hoveredAction, setHoveredAction] = useRecoilState(
    hoveredNamespaceActionAtom,
  );
  const setHoveredCanvasItem = useSetRecoilState(hoveredCanvasItemAtom);

  const action = useFragment(
    graphql`
      fragment CanvasSidebarTrafficHistoryActionRequest_action on Action {
        id
        actionId
        url
        target
        targetDomain
        ...ActionRequestText_action
      }
    `,
    actionRef,
  );

  const [resendAction, isLoading] = useResendAction();
  const onResendAction = () => {
    resendAction(action.id);
  };

  const url = `${action.targetDomain}${action.url}`;
  const isHovered =
    hoveredAction === action.actionId ||
    selectedActionIdentifier?.actionId === action.actionId;

  return (
    <DokkimiTooltip
      content={url}
      positioning="after"
      relationship="label"
      hideDelay={0}
    >
      <Flexbox
        fullWidth
        alignItems="center"
        justifyContent="space-between"
        className={clsx(styles.request, {
          [styles.requestHovered]: isHovered,
        })}
        onMouseEnter={() => {
          setHoveredAction(action.actionId);
          setHoveredCanvasItem(action.target);
        }}
        onMouseLeave={() => {
          setHoveredAction(null);
          setHoveredCanvasItem(null);
        }}
        onClick={() =>
          onClickAction({ id: action.id, actionId: action.actionId })
        }
      >
        <Flexbox alignItems="center" gap={4} fullWidth>
          {selectMode !== 'none' && (
            <Checkbox
              checked={isChecked}
              onChange={() =>
                onCheckAction({ id: action.id, actionId: action.actionId })
              }
              disabled={isDisabled}
            />
          )}
          <ActionRequestText
            actionRef={action}
            style={{
              width: isHovered ? 'calc(100% - 40px)' : '100%',
            }}
          />
        </Flexbox>
        {showHoverActions && isHovered && (
          <Flexbox alignItems="center" gap={4}>
            {isLoading ? (
              <Spinner size="extra-tiny" />
            ) : (
              <Button
                appearance="subtle"
                size="small"
                icon={<Icon name="send" />}
                onClick={e => {
                  e.stopPropagation();
                  onResendAction();
                }}
              />
            )}
          </Flexbox>
        )}
      </Flexbox>
    </DokkimiTooltip>
  );
}

const useStyles = createUseStyles({
  request: {
    height: 32,
    padding: '8px 12px',
    borderRadius: 8,
    overflow: 'hidden',
    cursor: 'pointer',
  },
  requestHovered: {
    backgroundColor: DokkimiColorsV2.blackQuaternary,
    fontWeight: 'bold',
  },
});
