import { Button } from '@fluentui/react-components';
import { createUseStyles } from 'react-jss';
import { graphql, useFragment } from 'react-relay';
import { useRecoilState } from 'recoil';

import { ActionIdentifier } from 'src/components/canvas/sidebar/shared/types';
import CanvasSidebarTrafficHistoryActionRequest, {
  SelectActionMode,
} from 'src/components/canvas/sidebar/trafficHistory/CanvasSidebarTrafficHistoryActionRequest';
import CanvasSidebarTrafficHistoryActionResponse from 'src/components/canvas/sidebar/trafficHistory/CanvasSidebarTrafficHistoryActionResponse';
import Flexbox from 'src/components/custom/Flexbox';
import Icon from 'src/components/custom/Icon';
import { DokkimiColorsV2 } from 'src/components/styles/colors';
import { collapsedHistorySectionsAtom } from 'src/recoil/dashboard/dashboard.atoms';
import { emptyFunction, toggleSet } from 'src/util/util';

import { CanvasSidebarTrafficHistorySection_actions$key } from './__generated__/CanvasSidebarTrafficHistorySection_actions.graphql';

type Props = {
  actionsRef: CanvasSidebarTrafficHistorySection_actions$key;
  timestamp: string;
  selectedActionIdentifier: ActionIdentifier | null;
  onClickAction: (actionIdentifier: ActionIdentifier) => void;
  selectMode?: SelectActionMode;
  checkedActions: Set<string>;
  onCheckAction?: (actionId: ActionIdentifier) => void;
  showHoverActions: boolean;
  disabledActions?: Set<string>;
};

export default function CanvasSidebarTrafficHistorySection({
  actionsRef,
  timestamp,
  selectedActionIdentifier,
  onClickAction,
  selectMode = 'none',
  checkedActions,
  onCheckAction = emptyFunction,
  showHoverActions,
  disabledActions = new Set(),
}: Props) {
  const styles = useStyles();
  const [collapsedSections, setCollapsedSections] = useRecoilState(
    collapsedHistorySectionsAtom,
  );
  const isExpanded = !collapsedSections.has(timestamp);

  const actions = useFragment(
    graphql`
      fragment CanvasSidebarTrafficHistorySection_actions on Action
      @relay(plural: true) {
        id
        type
        ...CanvasSidebarTrafficHistoryActionRequest_action
        ...CanvasSidebarTrafficHistoryActionResponse_action
      }
    `,
    actionsRef,
  );

  return (
    <Flexbox key={timestamp} direction="column">
      <Flexbox
        alignItems="center"
        gap={8}
        onClick={() => {
          setCollapsedSections(curr => toggleSet(curr, timestamp));
        }}
        className={styles.section}
      >
        <Button
          appearance="subtle"
          icon={<Icon name={isExpanded ? 'chevronDown' : 'chevronRight'} />}
          size="small"
        />
        <div>{timestamp}</div>
      </Flexbox>
      {isExpanded && (
        <Flexbox direction="column" gap={2}>
          {actions.map(action =>
            action.type === 'request' ? (
              <CanvasSidebarTrafficHistoryActionRequest
                key={action.id}
                actionRef={action}
                selectedActionIdentifier={selectedActionIdentifier}
                onClickAction={onClickAction}
                selectMode={selectMode}
                isChecked={checkedActions.has(action.id)}
                onCheckAction={onCheckAction}
                showHoverActions={showHoverActions}
                isDisabled={disabledActions.has(action.id)}
              />
            ) : (
              <CanvasSidebarTrafficHistoryActionResponse
                key={action.id}
                actionRef={action}
                selectedActionIdentifier={selectedActionIdentifier}
                onClickAction={onClickAction}
                selectMode={selectMode}
                isChecked={checkedActions.has(action.id)}
                onCheckAction={onCheckAction}
                isDisabled={disabledActions.has(action.id)}
              />
            ),
          )}
        </Flexbox>
      )}
    </Flexbox>
  );
}

const useStyles = createUseStyles({
  section: {
    padding: '8px 0px 8px 2px',
    cursor: 'pointer',

    '&:hover': {
      backgroundColor: DokkimiColorsV2.blackQuaternary,
      borderRadius: 8,
    },
  },
});
