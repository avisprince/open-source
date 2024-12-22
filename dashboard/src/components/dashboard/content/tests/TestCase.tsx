import { Divider } from '@fluentui/react-components';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import { createUseStyles } from 'react-jss';
import { graphql, useFragment } from 'react-relay';

import CanvasSidebarTestCaseModal from 'src/components/canvas/sidebar/tests/CanvasSidebarTestCaseModal';
import DokkimiLink from 'src/components/custom/DokkimiLink';
import Flexbox from 'src/components/custom/Flexbox';
import TestCaseTestRun from 'src/components/dashboard/content/tests/TestCaseTestRun';
import useToggleState from 'src/hooks/useToggleState';

import { TestCase_actions$key } from './__generated__/TestCase_actions.graphql';
import { TestCase_testCase$key } from './__generated__/TestCase_testCase.graphql';
import { TestCase_testSuite$key } from './__generated__/TestCase_testSuite.graphql';

type Props = {
  testCaseRef: TestCase_testCase$key;
  testSuiteRef: TestCase_testSuite$key;
  actionsRef: TestCase_actions$key;
  showDivider: boolean;
};

export default function TestCase({
  testCaseRef,
  testSuiteRef,
  actionsRef,
  showDivider,
}: Props) {
  const styles = useStyles();
  const [showModal, toggleShowModal] = useToggleState(false);

  const testCase = useFragment(
    graphql`
      fragment TestCase_testCase on TestCase {
        id
        name
        ...CanvasSidebarTestCaseModal_testCase
      }
    `,
    testCaseRef,
  );

  const { testRuns, testCaseSuccessRates } = useFragment(
    graphql`
      fragment TestCase_testSuite on TestSuite {
        testRuns {
          startTime
          testCases {
            testCaseId
            ...TestCaseTestRun_testRunTestCase
          }
        }
        testCaseSuccessRates {
          id
          successRate
        }
      }
    `,
    testSuiteRef,
  );

  const actions = useFragment(
    graphql`
      fragment TestCase_actions on Action @relay(plural: true) {
        ...CanvasSidebarTestCaseModal_actions
      }
    `,
    actionsRef,
  );

  const testRunTestCases = useMemo(() => {
    return testRuns.slice(0, 10).map(tr => {
      return tr.testCases.find(tc => tc.testCaseId === testCase.id) ?? null;
    });
  }, [testCase.id, testRuns]);

  const successRate = useMemo(() => {
    const result = testCaseSuccessRates.find(tc => tc.id === testCase.id);
    return (result?.successRate ?? 0) * 100;
  }, [testCaseSuccessRates, testCase.id]);

  return (
    <>
      <Flexbox
        alignItems="center"
        justifyContent="space-between"
        className={styles.testCase}
      >
        <div style={{ width: '33%' }}>
          <DokkimiLink onClick={toggleShowModal}>{testCase.name}</DokkimiLink>
        </div>
        <Flexbox
          alignItems="center"
          justifyContent="center"
          style={{ width: '33%' }}
          gap={32}
        >
          <Flexbox alignItems="center" gap={8}>
            {testRunTestCases.map((tc, index) => {
              const tooltip = dayjs(testRuns[index].startTime).format(
                'MM/DD/YY hh:mma',
              );

              return (
                <TestCaseTestRun
                  testCaseRef={tc}
                  tooltip={tooltip}
                  key={index}
                />
              );
            })}
          </Flexbox>
        </Flexbox>
        <Flexbox
          alignItems="center"
          justifyContent="end"
          style={{ width: '33%' }}
          shrink={0}
        >
          {successRate}%
        </Flexbox>
      </Flexbox>
      {showDivider && <Divider />}
      {showModal && (
        <CanvasSidebarTestCaseModal
          isOpen={showModal}
          onToggle={toggleShowModal}
          testCaseRef={testCase}
          actionsRef={actions}
          readOnly
        />
      )}
    </>
  );
}

const useStyles = createUseStyles({
  testCase: {
    height: 56,
    padding: '0 36px',
  },
});
