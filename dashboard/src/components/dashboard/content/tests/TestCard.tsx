import { Divider, MenuItem, Spinner } from '@fluentui/react-components';
import dayjs from 'dayjs';
import { useState } from 'react';
import { graphql, useFragment } from 'react-relay';

import ConfirmModal from 'src/components/custom/ConfirmModal';
import Flexbox from 'src/components/custom/Flexbox';
import Icon from 'src/components/custom/Icon';
import RightDownChevron from 'src/components/custom/RightDownChevron';
import EditDeleteMenu from 'src/components/dashboard/content/shared/EditDeleteMenu';
import TestEditModal from 'src/components/dashboard/content/tests/TestEditModal';
import TestRunResultBlock from 'src/components/dashboard/content/tests/TestRunResultBlock';
import TestSandbox from 'src/components/dashboard/content/tests/TestSandbox';
import useDeleteTestSuite from 'src/components/dashboard/content/tests/hooks/useDeleteTestSuite';
import useExpandedTests from 'src/components/dashboard/content/tests/hooks/useExpandedTests';
import useRunTestSuite from 'src/components/dashboard/content/tests/hooks/useRunTestSuite';
import { DokkimiColorsV2 } from 'src/components/styles/colors';
import { Stylesheet } from 'src/types/Stylesheet';

import { TestCard_testSuite$key } from './__generated__/TestCard_testSuite.graphql';

type Props = {
  testCardRef: TestCard_testSuite$key;
};

export default function TestCard({ testCardRef }: Props) {
  const testSuite = useFragment(
    graphql`
      fragment TestCard_testSuite on TestSuite {
        id
        name
        successRate
        namespaces {
          id
          ...TestSandbox_namespace
        }
        testRuns {
          id
          startTime
          success
        }
        ...TestEditModal_testSuite
        ...TestSandbox_testSuite
      }
    `,
    testCardRef,
  );

  const [isExpanded, toggleTest] = useExpandedTests(testSuite.id);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteTestSuite] = useDeleteTestSuite();
  const [runTestSuite, isTestRunning] = useRunTestSuite();

  const onDelete = () => {
    deleteTestSuite(testSuite.id);
  };

  const onRunTest = () => {
    runTestSuite(testSuite.id);
  };

  return (
    <>
      <Flexbox direction="column" gap={8} style={styles.card}>
        <Flexbox alignItems="center" justifyContent="space-between">
          <Flexbox gap={8} alignItems="center" style={{ width: '33%' }}>
            <RightDownChevron isExpanded={isExpanded} onClick={toggleTest} />
            <div>{testSuite.name}</div>
          </Flexbox>

          <Flexbox
            alignItems="center"
            justifyContent="center"
            style={{ width: '33%' }}
          >
            {!isExpanded && (
              <Flexbox alignItems="center" gap={8}>
                {testSuite.testRuns.map(tr => {
                  const tooltip = dayjs(tr.startTime).format('MM/DD/YY hh:mma');
                  return (
                    <TestRunResultBlock
                      key={tr.id}
                      tooltip={tooltip}
                      success={!!tr.success}
                    />
                  );
                })}
              </Flexbox>
            )}
          </Flexbox>

          <Flexbox
            alignItems="center"
            justifyContent="end"
            gap={16}
            style={{ width: '33%' }}
          >
            <div style={{ marginRight: 8 }}>
              {isTestRunning && (
                <Flexbox alignItems="center" gap={8}>
                  <Spinner size="tiny" />
                  <div>Running</div>
                </Flexbox>
              )}
              {/* {!isTestRunning && (
                <div>
                  {testSuite.schedule
                    ? 'Scheduled: ' + cronstrue.toString(testSuite.schedule)
                    : 'Not scheduled'}
                </div>
              )} */}
            </div>
            <div>{testSuite.successRate * 100}%</div>
            <EditDeleteMenu
              startContent={
                testSuite.namespaces.length > 0 && (
                  <>
                    <MenuItem
                      icon={
                        isTestRunning ? (
                          <Spinner size="tiny" />
                        ) : (
                          <Icon name="play" />
                        )
                      }
                      onClick={onRunTest}
                    >
                      Run Test
                    </MenuItem>
                    <Divider />
                  </>
                )
              }
              onEdit={() => setShowEditModal(true)}
              onDelete={() => setShowConfirmModal(true)}
            />
          </Flexbox>
        </Flexbox>
        {isExpanded && (
          <Flexbox direction="column" gap={8}>
            {testSuite.namespaces.map(ns => (
              <TestSandbox
                key={ns.id}
                namespaceRef={ns}
                testSuiteRef={testSuite}
              />
            ))}
          </Flexbox>
        )}
      </Flexbox>
      {showEditModal && (
        <TestEditModal
          testEditModalRef={testSuite}
          onModalClose={() => setShowEditModal(false)}
          show={showEditModal}
        />
      )}
      <ConfirmModal
        isOpen={showConfirmModal}
        toggle={() => setShowConfirmModal(false)}
        title="Delete Test"
        subtitle={`Are you sure you want to delete the test: ${testSuite.name}?`}
        buttonText="Delete"
        onConfirm={onDelete}
      />
    </>
  );
}

const styles = {
  card: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: DokkimiColorsV2.blackQuaternary,
  },
} satisfies Stylesheet;
