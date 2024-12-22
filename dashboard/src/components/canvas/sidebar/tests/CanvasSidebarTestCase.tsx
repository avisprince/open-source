import { Button, Divider } from '@fluentui/react-components';
import { clsx } from 'clsx';
import { useState } from 'react';
import { createUseStyles } from 'react-jss';
import { graphql, useFragment } from 'react-relay';

import ActionRequestText from 'src/components/canvas/sidebar/shared/ActionRequestText';
import ActionResponseText from 'src/components/canvas/sidebar/shared/ActionResponseText';
import CanvasSidebarTestCaseModal from 'src/components/canvas/sidebar/tests/CanvasSidebarTestCaseModal';
import useDeleteTestCase from 'src/components/canvas/sidebar/tests/hooks/useDeleteTestCase';
import DokkimiTooltip from 'src/components/custom/DokkimiTooltip';
import Flexbox from 'src/components/custom/Flexbox';
import Icon from 'src/components/custom/Icon';
import EditDeleteMenu from 'src/components/dashboard/content/shared/EditDeleteMenu';
import { DokkimiColorsV2 } from 'src/components/styles/colors';
import useToggleState from 'src/hooks/useToggleState';

import { CanvasSidebarTestCase_actions$key } from './__generated__/CanvasSidebarTestCase_actions.graphql';
import { CanvasSidebarTestCase_testCase$key } from './__generated__/CanvasSidebarTestCase_testCase.graphql';

type Props = {
  testCaseRef: CanvasSidebarTestCase_testCase$key;
  actionsRef: CanvasSidebarTestCase_actions$key;
  sortMode: boolean;
};

export default function CanvasSidebarTestCase({
  testCaseRef,
  actionsRef,
  sortMode,
}: Props) {
  const styles = useStyles();
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, toggleExpanded] = useToggleState(false);
  const [showModal, toggleModal] = useToggleState(false);
  const [deleteTestCase] = useDeleteTestCase();

  const testCase = useFragment(
    graphql`
      fragment CanvasSidebarTestCase_testCase on TestCase {
        id
        name
        execution {
          ...ActionRequestText_action
        }
        assertions {
          action {
            type
            ...ActionRequestText_action
            ...ActionResponseText_action
          }
        }
        ...CanvasSidebarTestCaseModal_testCase
      }
    `,
    testCaseRef,
  );

  const actions = useFragment(
    graphql`
      fragment CanvasSidebarTestCase_actions on Action @relay(plural: true) {
        __typename
        id
        ...CanvasSidebarTestCaseModal_actions
      }
    `,
    actionsRef,
  );

  return (
    <>
      <Flexbox
        direction="column"
        className={clsx(styles.testCase, {
          [styles.expandedTestCase]: isExpanded,
        })}
        gap={8}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <DokkimiTooltip
          relationship="label"
          content={testCase.name}
          positioning="after"
          hideDelay={0}
        >
          <Flexbox alignItems="center" gap={8} className={styles.nameContainer}>
            {sortMode && (
              <Button
                appearance="subtle"
                icon={<Icon name="reorderDotsVertical" />}
                size="small"
                style={{ cursor: 'inherit' }}
              />
            )}
            <div className={styles.title}>{testCase.name}</div>
            {isHovered && !sortMode && (
              <Flexbox
                alignItems="center"
                gap={4}
                className={styles.titleActions}
              >
                <EditDeleteMenu
                  onEdit={toggleModal}
                  onDelete={() => deleteTestCase(testCase.id)}
                  size="small"
                />
                <Button
                  appearance="subtle"
                  icon={
                    <Icon name={isExpanded ? 'chevronDown' : 'chevronRight'} />
                  }
                  onClick={toggleExpanded}
                  size="small"
                />
              </Flexbox>
            )}
          </Flexbox>
        </DokkimiTooltip>
        {isExpanded && !sortMode && (
          <Flexbox direction="column" gap={8}>
            <Divider />
            <Flexbox direction="column" gap={4}>
              <div>Execution:</div>
              <ActionRequestText
                actionRef={testCase.execution}
                style={{ paddingLeft: 8 }}
              />
            </Flexbox>
            <Flexbox direction="column" gap={4}>
              <div>Assertions:</div>
              <Flexbox direction="column" gap={8}>
                {testCase.assertions
                  .map((assertion, index) => {
                    return assertion.action.type === 'request' ? (
                      <ActionRequestText
                        key={index}
                        actionRef={assertion.action}
                        style={{ paddingLeft: 8 }}
                      />
                    ) : (
                      <ActionResponseText
                        key={index}
                        actionRef={assertion.action}
                        style={{ paddingLeft: 8 }}
                      />
                    );
                  })
                  .reverse()}
              </Flexbox>
            </Flexbox>
          </Flexbox>
        )}
      </Flexbox>
      {showModal && (
        <CanvasSidebarTestCaseModal
          testCaseRef={testCase}
          actionsRef={actions}
          isOpen={showModal}
          onToggle={toggleModal}
        />
      )}
    </>
  );
}

const useStyles = createUseStyles({
  container: {
    padding: 12,
  },
  expandedTestCase: {
    backgroundColor: DokkimiColorsV2.blackTertiary,
    margin: '4px 0',
  },
  nameContainer: {
    height: 20,
  },
  section: {
    paddingLeft: 12,
  },
  testCase: {
    padding: '8px 12px',
    borderRadius: 8,

    '&:hover': {
      backgroundColor: DokkimiColorsV2.blackQuaternary,
    },
  },
  title: {
    flexGrow: 1,
    fontSize: 14,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  titleActions: {
    marginLeft: 4,
  },
});
