import { Checkbox } from '@fluentui/react-components';
import clsx from 'clsx';
import { createUseStyles } from 'react-jss';
import { graphql, useFragment } from 'react-relay';
import { useRecoilState } from 'recoil';

import ActionResponseText from 'src/components/canvas/sidebar/shared/ActionResponseText';
import { ActionIdentifier } from 'src/components/canvas/sidebar/shared/types';
import DokkimiTooltip from 'src/components/custom/DokkimiTooltip';
import Flexbox from 'src/components/custom/Flexbox';
import { DokkimiColorsV2 } from 'src/components/styles/colors';
import { hoveredNamespaceActionAtom } from 'src/recoil/dashboard/dashboard.atoms';
import { emptyFunction } from 'src/util/util';

import { CanvasSidebarTrafficHistoryActionResponse_action$key } from './__generated__/CanvasSidebarTrafficHistoryActionResponse_action.graphql';

export type SelectActionMode = 'none' | 'single' | 'multi';

type Props = {
  actionRef: CanvasSidebarTrafficHistoryActionResponse_action$key;
  selectedActionIdentifier: ActionIdentifier | null;
  onClickAction: (actionIdentifier: ActionIdentifier) => void;
  selectMode?: SelectActionMode;
  isChecked?: boolean;
  onCheckAction?: (actionId: ActionIdentifier) => void;
  isDisabled?: boolean;
};

export default function CanvasSidebarTrafficHistoryActionResponse({
  actionRef,
  selectedActionIdentifier,
  onClickAction,
  selectMode = 'none',
  isChecked,
  onCheckAction = emptyFunction,
  isDisabled,
}: Props) {
  const styles = useStyles();
  const [hoveredAction, setHoveredAction] = useRecoilState(
    hoveredNamespaceActionAtom,
  );

  const action = useFragment(
    graphql`
      fragment CanvasSidebarTrafficHistoryActionResponse_action on Action {
        id
        actionId
        originDomain
        url
        ...ActionResponseText_action
      }
    `,
    actionRef,
  );

  const url = `${action.originDomain}${action.url}`;
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
        gap={4}
        className={clsx(styles.request, {
          [styles.requestHovered]: isHovered,
        })}
        onMouseEnter={() => {
          setHoveredAction(action.actionId);
        }}
        onMouseLeave={() => {
          setHoveredAction(null);
        }}
        onClick={() =>
          onClickAction({ id: action.id, actionId: action.actionId })
        }
      >
        {selectMode !== 'none' && (
          <Checkbox
            checked={isChecked}
            onChange={() => {
              onCheckAction({ id: action.id, actionId: action.actionId });
            }}
            disabled={isDisabled}
          />
        )}
        <ActionResponseText actionRef={action} />
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
