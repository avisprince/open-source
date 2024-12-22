import { graphql, useFragment } from 'react-relay';

import TestCaseTestRunModal from 'src/components/dashboard/content/tests/TestCaseTestRunModal';
import TestRunResultBlock from 'src/components/dashboard/content/tests/TestRunResultBlock';
import useToggleState from 'src/hooks/useToggleState';

import { TestCaseTestRun_testRunTestCase$key } from './__generated__/TestCaseTestRun_testRunTestCase.graphql';

type Props = {
  testCaseRef: TestCaseTestRun_testRunTestCase$key | null;
  tooltip: string;
};

export default function TestCaseTestRun({ testCaseRef, tooltip }: Props) {
  const [showModal, toggleShowModal] = useToggleState(false);

  const testCase = useFragment(
    graphql`
      fragment TestCaseTestRun_testRunTestCase on TestRunTestCase {
        success
        ...TestCaseTestRunModal_testCase
      }
    `,
    testCaseRef,
  );

  return (
    <>
      <TestRunResultBlock
        success={testCase?.success}
        tooltip={tooltip}
        onClick={toggleShowModal}
      />
      {testCase && showModal && (
        <TestCaseTestRunModal
          testCaseRef={testCase}
          isOpen={showModal}
          onClose={toggleShowModal}
        />
      )}
    </>
  );
}
