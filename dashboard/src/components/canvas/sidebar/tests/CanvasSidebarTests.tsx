import { Button, Input, Spinner, Tooltip } from '@fluentui/react-components';
import { useMemo, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { graphql, useFragment } from 'react-relay';

import CanvasSidebarTestCase from 'src/components/canvas/sidebar/tests/CanvasSidebarTestCase';
import CanvasSidebarTestCaseModal from 'src/components/canvas/sidebar/tests/CanvasSidebarTestCaseModal';
import useUpdateTestOrder from 'src/components/canvas/sidebar/tests/hooks/useUpdateTestOrder';
import Flexbox from 'src/components/custom/Flexbox';
import Icon from 'src/components/custom/Icon';
import SortableList from 'src/components/custom/SortableList';
import useToggleState from 'src/hooks/useToggleState';

import {
  CanvasSidebarTests_namespace$data,
  CanvasSidebarTests_namespace$key,
} from './__generated__/CanvasSidebarTests_namespace.graphql';

const reorderList = <T,>(l: T[], startIndex: number, newIndex: number) => {
  const result = [...l]; // Create a copy of the array
  const [element] = result.splice(startIndex, 1); // Remove the element from the start index
  result.splice(newIndex, 0, element); // Insert the element at the new index

  return result;
};

type Props = {
  namespaceRef: CanvasSidebarTests_namespace$key;
};

export default function CanvasSidebarTests({ namespaceRef }: Props) {
  const styles = useStyles();
  const [filter, setFilter] = useState('');
  const [isModalOpen, toggleModalOpen] = useToggleState(false);
  const [isSorting, toggleIsSorting] = useToggleState(false);
  const [updateTestOrder, isLoading] = useUpdateTestOrder();

  const namespace = useFragment(
    graphql`
      fragment CanvasSidebarTests_namespace on Namespace {
        actions {
          ...CanvasSidebarTestCase_actions
          ...CanvasSidebarTestCaseModal_actions
        }
        testCases {
          id
          name
          ...CanvasSidebarTestCase_testCase
        }
      }
    `,
    namespaceRef,
  );

  const [sortedTests, setSortedTests] = useState<
    CanvasSidebarTests_namespace$data['testCases']
  >([]);

  const testCases = useMemo(() => {
    if (isSorting) {
      return sortedTests;
    }

    return namespace.testCases.filter(testCase =>
      testCase.name.toLocaleLowerCase().includes(filter.toLocaleLowerCase()),
    );
  }, [namespace.testCases, filter, sortedTests, isSorting]);

  const onOrderChange = (startIndex: number, endIndex: number) => {
    const list = reorderList([...sortedTests], startIndex, endIndex);
    setSortedTests(list);
  };

  const onStartSorting = () => {
    setSortedTests(namespace.testCases);
    toggleIsSorting();
  };

  const onCancelSorting = () => {
    setSortedTests([]);
    toggleIsSorting();
  };

  const onSaveSorting = () => {
    updateTestOrder(
      sortedTests.map(t => t.id),
      onCancelSorting,
    );
  };

  return (
    <>
      <Flexbox direction="column" className={styles.container} gap={8}>
        {!isSorting && (
          <Flexbox alignItems="center" gap={8}>
            <Input
              value={filter}
              onChange={e => setFilter(e.target.value)}
              placeholder="Search..."
              className={styles.filter}
            />
            <Flexbox alignItems="center">
              <Tooltip
                content="New Test"
                relationship="label"
                positioning="after"
                hideDelay={0}
              >
                <Button
                  appearance="subtle"
                  icon={<Icon name="plus" />}
                  onClick={toggleModalOpen}
                />
              </Tooltip>
              <Tooltip
                content="Reorder Tests"
                relationship="label"
                positioning="after"
                hideDelay={0}
              >
                <Button
                  appearance="subtle"
                  icon={<Icon name="arrowSort" />}
                  onClick={onStartSorting}
                />
              </Tooltip>
            </Flexbox>
          </Flexbox>
        )}
        {isSorting && (
          <Flexbox alignItems="center" gap={8} fullWidth>
            <Button
              appearance="secondary"
              style={{ width: '50%' }}
              onClick={onCancelSorting}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              appearance="primary"
              style={{ width: '50%' }}
              onClick={onSaveSorting}
              disabled={isLoading}
            >
              {isLoading ? <Spinner size="tiny" /> : 'Save'}
            </Button>
          </Flexbox>
        )}
        <SortableList sortingEnabled={isSorting} onOrderChange={onOrderChange}>
          {testCases.map(testCase => (
            <CanvasSidebarTestCase
              key={testCase.id}
              testCaseRef={testCase}
              actionsRef={namespace.actions}
              sortMode={isSorting}
            />
          ))}
        </SortableList>
      </Flexbox>
      {isModalOpen && (
        <CanvasSidebarTestCaseModal
          testCaseRef={null}
          actionsRef={namespace.actions}
          isOpen={isModalOpen}
          onToggle={toggleModalOpen}
        />
      )}
    </>
  );
}

const useStyles = createUseStyles({
  container: {
    padding: 12,
    overflow: 'hidden',
  },
  filter: {
    flexGrow: 1,
  },
  testCases: {
    overflowY: 'auto',
  },
});
