import { Button } from '@fluentui/react-components';
import { faVial } from '@fortawesome/free-solid-svg-icons';
import { useMemo, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { graphql, useFragment } from 'react-relay';

import ActionRequestText from 'src/components/canvas/sidebar/shared/ActionRequestText';
import { ActionIdentifier } from 'src/components/canvas/sidebar/shared/types';
import CanvasSidebarTrafficHistoryActionModal from 'src/components/canvas/sidebar/trafficHistory/CanvasSidebarTrafficHistoryActionModal';
import Flexbox from 'src/components/custom/Flexbox';
import Icon from 'src/components/custom/Icon';
import { DokkimiColorsV2 } from 'src/components/styles/colors';
import useToggleState from 'src/hooks/useToggleState';

import { CanvasSidebarTestCaseModalExecution_actions$key } from './__generated__/CanvasSidebarTestCaseModalExecution_actions.graphql';

type Props = {
  actionsRef: CanvasSidebarTestCaseModalExecution_actions$key;
  selectedExecution: ActionIdentifier | null;
  setSelectedExecution: (actionIdentifier: ActionIdentifier | null) => void;
  readOnly?: boolean;
};

export default function CanvasSidebarTestCaseModalExecution({
  actionsRef,
  selectedExecution,
  setSelectedExecution,
  readOnly = false,
}: Props) {
  const styles = useStyles();
  const [textHover, setTextHover] = useState(false);
  const [showExecutionModal, toggleExecutionModal] = useToggleState(false);
  const [showActionModal, toggleActionModal] = useToggleState(false);

  const actions = useFragment(
    graphql`
      fragment CanvasSidebarTestCaseModalExecution_actions on Action
      @relay(plural: true) {
        actionId
        type
        ...ActionRequestText_action
        ...CanvasSidebarTrafficHistoryActionModal_actions
      }
    `,
    actionsRef,
  );

  const execution = useMemo(() => {
    return actions.find(
      action =>
        action.actionId === selectedExecution?.actionId &&
        action.type === 'request',
    );
  }, [selectedExecution, actions]);

  return (
    <>
      <Flexbox direction="column">
        <Flexbox alignItems="center" gap={4}>
          <div>Execution</div>
          {!readOnly && (
            <Button
              appearance="subtle"
              icon={<Icon name="edit" size={16} />}
              onClick={toggleExecutionModal}
            />
          )}
        </Flexbox>
        {execution && (
          <div className={styles.execution}>
            <Flexbox
              alignItems="center"
              justifyContent="space-between"
              onClick={toggleActionModal}
              className={styles.executionText}
              shrink={0}
              onMouseEnter={() => setTextHover(true)}
              onMouseLeave={() => setTextHover(false)}
            >
              <ActionRequestText actionRef={execution} />
              {textHover && (
                <Button
                  appearance="subtle"
                  icon={<Icon name="arrowExpand" size={16} />}
                />
              )}
            </Flexbox>
          </div>
        )}
      </Flexbox>
      {showExecutionModal && (
        <CanvasSidebarTrafficHistoryActionModal
          actionsRef={actions}
          isOpen={showExecutionModal}
          toggle={toggleExecutionModal}
          title="Select Test Case Execution"
          titleIcon={faVial}
          initialActionIdentifier={selectedExecution}
          onSave={({ selectedAction }) => setSelectedExecution(selectedAction)}
          showFooter
          onlyDokkimiActions
        />
      )}
      {showActionModal && (
        <CanvasSidebarTrafficHistoryActionModal
          actionsRef={actions}
          isOpen={showActionModal}
          toggle={toggleActionModal}
          title="Test Case Execution"
          titleIcon={faVial}
          initialActionIdentifier={selectedExecution}
          showFooter={false}
          onlyDokkimiActions
          hideSidebar
          width={700}
        />
      )}
    </>
  );
}

const useStyles = createUseStyles({
  execution: {
    paddingLeft: 8,
  },
  executionText: {
    height: 36,
    paddingLeft: 8,
    cursor: 'pointer',

    '&:hover': {
      padding: '0 0 0 8px',
      fontWeight: 'bold',
      backgroundColor: DokkimiColorsV2.blackQuaternary,
      borderRadius: 8,
    },
  },
});
