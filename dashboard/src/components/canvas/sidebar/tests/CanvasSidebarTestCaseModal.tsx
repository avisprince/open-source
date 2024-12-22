import { Button, Input, Spinner } from '@fluentui/react-components';
import { faVial } from '@fortawesome/free-solid-svg-icons';
import { Dictionary } from 'lodash';
import { useMemo, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { graphql, useFragment } from 'react-relay';

import { ActionIdentifier } from 'src/components/canvas/sidebar/shared/types';
import CanvasSidebarTestCaseModalAssertions from 'src/components/canvas/sidebar/tests/CanvasSidebarTestCaseModalAssertions';
import CanvasSidebarTestCaseModalExecution from 'src/components/canvas/sidebar/tests/CanvasSidebarTestCaseModalExecution';
import { TestCaseAssertionInput } from 'src/components/canvas/sidebar/tests/hooks/__generated__/useCreateTestCaseMutation.graphql';
import useCreateTestCase from 'src/components/canvas/sidebar/tests/hooks/useCreateTestCase';
import useUpdateTestCase from 'src/components/canvas/sidebar/tests/hooks/useUpdateTestCase';
import DokkimiModal from 'src/components/custom/DokkimiModal';
import DokkimiModalTitle from 'src/components/custom/DokkimiModalTitle';
import Flexbox from 'src/components/custom/Flexbox';

import { CanvasSidebarTestCaseModal_actions$key } from './__generated__/CanvasSidebarTestCaseModal_actions.graphql';
import { CanvasSidebarTestCaseModal_testCase$key } from './__generated__/CanvasSidebarTestCaseModal_testCase.graphql';

type Props = {
  testCaseRef: CanvasSidebarTestCaseModal_testCase$key | null;
  actionsRef: CanvasSidebarTestCaseModal_actions$key;
  isOpen: boolean;
  onToggle: () => void;
  readOnly?: boolean;
};

export default function CanvasSidebarTestCaseModal({
  testCaseRef,
  actionsRef,
  isOpen,
  onToggle,
  readOnly = false,
}: Props) {
  const styles = useStyles();
  const [createTestCase, isCreateLoading] = useCreateTestCase();
  const [updateTestCase, isUpdateLoading] = useUpdateTestCase();
  const isLoading = isCreateLoading || isUpdateLoading;

  const testCase = useFragment(
    graphql`
      fragment CanvasSidebarTestCaseModal_testCase on TestCase {
        id
        name
        execution {
          id
          actionId
        }
        assertions {
          schema
          action {
            id
          }
        }
      }
    `,
    testCaseRef,
  );

  const actions = useFragment(
    graphql`
      fragment CanvasSidebarTestCaseModal_actions on Action
      @relay(plural: true) {
        id
        ...CanvasSidebarTestCaseModalExecution_actions
        ...CanvasSidebarTestCaseModalAssertions_actions
      }
    `,
    actionsRef,
  );

  const [testName, setTestName] = useState(testCase?.name ?? '');
  const [selectedExecution, setSelectedExecution] =
    useState<ActionIdentifier | null>(
      testCase
        ? {
            id: testCase?.execution.id,
            actionId: testCase?.execution.actionId,
          }
        : null,
    );

  const defaultTestAssertions = useMemo(() => {
    return (
      testCase?.assertions.reduce((acc, { schema, action }) => {
        return {
          ...acc,
          [action.id]: schema,
        };
      }, {}) ?? {}
    );
  }, [testCase]);

  const [testAssertions, setTestAssertions] = useState<Dictionary<string>>(
    defaultTestAssertions,
  );

  const assertions = useMemo<TestCaseAssertionInput[]>(() => {
    return Object.entries(testAssertions)
      .filter(([id]) => id !== selectedExecution?.id)
      .map(([id, schema]) => ({
        action: id,
        schema,
      }));
  }, [selectedExecution, testAssertions]);

  const onClose = () => {
    setTestName('');
    setSelectedExecution(null);
    setTestAssertions({});
    onToggle();
  };

  const onSave = () => {
    if (!selectedExecution) {
      return;
    }

    const saveFunc = !!testCase ? updateTestCase : createTestCase;
    saveFunc({
      id: testCase?.id,
      name: testName,
      execution: selectedExecution.id,
      assertions,
    });

    onClose();
  };

  const title = useMemo(() => {
    if (readOnly) {
      return testCase?.name ?? '';
    }

    return `${!!testCase ? 'Edit' : 'New'} Test Case`;
  }, [testCase, readOnly]);

  return (
    <DokkimiModal
      width={500}
      isOpen={isOpen}
      toggle={onClose}
      showCloseButton
      showHeaderDivider
      title={<DokkimiModalTitle icon={faVial} title={title} />}
    >
      <Flexbox direction="column" className={styles.container} gap={12}>
        {!readOnly && (
          <Flexbox direction="column" gap={4}>
            <div>Test Name</div>
            <Input
              placeholder="Test Name"
              value={testName}
              onChange={e => setTestName(e.target.value)}
            />
          </Flexbox>
        )}
        <CanvasSidebarTestCaseModalExecution
          actionsRef={actions}
          selectedExecution={selectedExecution}
          setSelectedExecution={setSelectedExecution}
          readOnly={readOnly}
        />
        {selectedExecution && (
          <CanvasSidebarTestCaseModalAssertions
            actionsRef={actions}
            editMode={!!testCase}
            selectedExecution={selectedExecution}
            testAssertions={testAssertions}
            setTestAssertions={setTestAssertions}
            readOnly={readOnly}
          />
        )}
        {!readOnly && (
          <Flexbox alignItems="center" justifyContent="end" gap={8}>
            <Button appearance="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              appearance="primary"
              disabled={
                isLoading ||
                !testName ||
                !selectedExecution ||
                Object.values(testAssertions).length === 0
              }
              onClick={onSave}
            >
              {isLoading ? <Spinner size="tiny" /> : 'Save'}
            </Button>
          </Flexbox>
        )}
      </Flexbox>
    </DokkimiModal>
  );
}

const useStyles = createUseStyles({
  container: {
    padding: 16,
  },
});
