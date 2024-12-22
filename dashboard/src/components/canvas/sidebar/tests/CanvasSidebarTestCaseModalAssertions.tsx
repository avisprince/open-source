import { Button } from '@fluentui/react-components';
import { faVial } from '@fortawesome/free-solid-svg-icons';
import { Dictionary } from 'lodash';
import { useEffect, useMemo } from 'react';
import { createUseStyles } from 'react-jss';
import { graphql, useFragment } from 'react-relay';

import { ActionIdentifier } from 'src/components/canvas/sidebar/shared/types';
import CanvasSidebarTestCaseModalAssertion from 'src/components/canvas/sidebar/tests/CanvasSidebarTestCaseModalAssertion';
import CanvasSidebarTrafficHistoryActionModal from 'src/components/canvas/sidebar/trafficHistory/CanvasSidebarTrafficHistoryActionModal';
import Flexbox from 'src/components/custom/Flexbox';
import Icon from 'src/components/custom/Icon';
import useToggleState from 'src/hooks/useToggleState';
import { generateSchema } from 'src/util/jsonSchemaGenerator';
import { safeJSONparse } from 'src/util/util';

import {
  CanvasSidebarTestCaseModalAssertions_actions$data,
  CanvasSidebarTestCaseModalAssertions_actions$key,
} from './__generated__/CanvasSidebarTestCaseModalAssertions_actions.graphql';

type Props = {
  actionsRef: CanvasSidebarTestCaseModalAssertions_actions$key;
  editMode: boolean;
  selectedExecution: ActionIdentifier;
  testAssertions: Dictionary<string>;
  setTestAssertions: (assertions: Dictionary<string>) => void;
  readOnly?: boolean;
};

export default function CanvasSidebarTestCaseModalAssertions({
  actionsRef,
  editMode,
  selectedExecution,
  testAssertions,
  setTestAssertions,
  readOnly = false,
}: Props) {
  const styles = useStyles();
  const [showAssertionsModal, toggleAssertionsModal] = useToggleState(false);

  const actions = useFragment(
    graphql`
      fragment CanvasSidebarTestCaseModalAssertions_actions on Action
      @relay(plural: true) {
        id
        originDomain
        headers
        body
        ...CanvasSidebarTestCaseModalAssertion_action
        ...CanvasSidebarTrafficHistoryActionModal_actions
      }
    `,
    actionsRef,
  );

  const filteredActions = useMemo(() => {
    const reversedActions = [...actions].reverse();
    const executionIndex = reversedActions.findIndex(
      action => action.id === selectedExecution.id,
    );

    const nextDokkimiActionIndex = reversedActions
      .slice(executionIndex + 1)
      .findIndex(action => action.originDomain === 'dokkimi');

    const endIndex =
      nextDokkimiActionIndex < 0
        ? actions.length
        : nextDokkimiActionIndex + executionIndex;

    return reversedActions.slice(executionIndex, endIndex + 1);
  }, [actions, selectedExecution]);

  const assertions = useMemo(() => {
    return actions
      .filter(
        action =>
          action.id !== selectedExecution.id && !!testAssertions[action.id],
      )
      .reverse();
  }, [selectedExecution, testAssertions, actions]);

  const getActionSchema = (
    action: CanvasSidebarTestCaseModalAssertions_actions$data[number],
  ) => {
    return JSON.stringify(
      generateSchema({
        headers: safeJSONparse(action.headers),
        body: safeJSONparse(action.body),
      }),
    );
  };

  useEffect(() => {
    if (!editMode) {
      const assertions = filteredActions.reduce(
        (acc, action) => ({
          ...acc,
          [action.id]: getActionSchema(action),
        }),
        {},
      );

      setTestAssertions(assertions);
    }
  }, [editMode, filteredActions, setTestAssertions]);

  const initialCheckedActions = useMemo(
    () => new Set(Object.keys(testAssertions)),
    [testAssertions],
  );

  return (
    <>
      <Flexbox direction="column">
        <Flexbox alignItems="center" gap={4}>
          <div>Assertions</div>
          {!readOnly && (
            <Button
              appearance="subtle"
              icon={<Icon name="edit" size={16} />}
              onClick={toggleAssertionsModal}
            />
          )}
        </Flexbox>
        <Flexbox direction="column" className={styles.assertionsList}>
          {assertions.map(assertion => (
            <CanvasSidebarTestCaseModalAssertion
              key={assertion.id}
              actionRef={assertion}
              schema={testAssertions[assertion.id]}
              onSchemaChange={schema => {
                setTestAssertions({
                  ...testAssertions,
                  [assertion.id]: schema,
                });
              }}
              readOnly={readOnly}
            />
          ))}
        </Flexbox>
      </Flexbox>
      {showAssertionsModal && (
        <CanvasSidebarTrafficHistoryActionModal
          actionsRef={filteredActions}
          isOpen={showAssertionsModal}
          toggle={toggleAssertionsModal}
          title="Select Test Case Assertions"
          titleIcon={faVial}
          selectMode="multi"
          initialCheckedActions={initialCheckedActions}
          showFooter
          onSave={({ checkedActions }) => {
            const assertions = Array.from(checkedActions).reduce((acc, id) => {
              const action = filteredActions.find(a => a.id === id);
              if (!action) {
                return acc;
              }

              return {
                ...acc,
                [id]: testAssertions[id] ?? getActionSchema(action),
              };
            }, {});

            setTestAssertions(assertions);
          }}
          disabledActions={new Set([selectedExecution.id])}
        />
      )}
    </>
  );
}

const useStyles = createUseStyles({
  assertionsList: {
    maxHeight: 200,
    paddingLeft: 8,
    overflowY: 'auto',
  },
});
