import { Button } from '@fluentui/react-components';
import { useState } from 'react';
import { createUseStyles } from 'react-jss';
import { graphql, useFragment } from 'react-relay';

import ActionRequestText from 'src/components/canvas/sidebar/shared/ActionRequestText';
import ActionResponseText from 'src/components/canvas/sidebar/shared/ActionResponseText';
import CanvasSidebarTestCaseAssertionSchemaEditor from 'src/components/canvas/sidebar/tests/CanvasSidebarTestCaseAssertionSchemaEditor';
import Flexbox from 'src/components/custom/Flexbox';
import Icon from 'src/components/custom/Icon';
import { DokkimiColorsV2 } from 'src/components/styles/colors';
import useToggleState from 'src/hooks/useToggleState';

import { CanvasSidebarTestCaseModalAssertion_action$key } from './__generated__/CanvasSidebarTestCaseModalAssertion_action.graphql';

type Props = {
  actionRef: CanvasSidebarTestCaseModalAssertion_action$key;
  schema: string;
  onSchemaChange: (schema: string) => void;
  readOnly?: boolean;
};

export default function CanvasSidebarTestCaseModalAssertion({
  actionRef,
  schema,
  onSchemaChange,
  readOnly,
}: Props) {
  const styles = useStyles();
  const [isHover, setIsHover] = useState(false);
  const [showModal, toggleShowModal] = useToggleState(false);

  const assertion = useFragment(
    graphql`
      fragment CanvasSidebarTestCaseModalAssertion_action on Action {
        id
        type
        ...ActionRequestText_action
        ...ActionResponseText_action
        ...CanvasSidebarTestCaseAssertionSchemaEditor_action
      }
    `,
    actionRef,
  );

  return (
    <>
      <Flexbox
        key={assertion.id}
        alignItems="center"
        justifyContent="space-between"
        onClick={toggleShowModal}
        className={styles.container}
        shrink={0}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
      >
        {assertion.type === 'request' ? (
          <ActionRequestText actionRef={assertion} />
        ) : (
          <ActionResponseText actionRef={assertion} />
        )}
        {isHover && (
          <Button
            appearance="subtle"
            icon={<Icon name="arrowExpand" size={16} />}
          />
        )}
      </Flexbox>
      {showModal && (
        <CanvasSidebarTestCaseAssertionSchemaEditor
          actionRef={assertion}
          assertionSchema={schema}
          isOpen={showModal}
          onClose={toggleShowModal}
          onSave={onSchemaChange}
          readOnly={readOnly}
        />
      )}
    </>
  );
}

const useStyles = createUseStyles({
  container: {
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
