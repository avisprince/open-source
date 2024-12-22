import { faFileCode } from '@fortawesome/free-solid-svg-icons';
import { graphql, useFragment } from 'react-relay';

import TestCaseAssertionSchemaEditor from 'src/components/canvas/sidebar/shared/TestCaseAssertionSchemaEditor';
import DokkimiModal from 'src/components/custom/DokkimiModal';
import DokkimiModalTitle from 'src/components/custom/DokkimiModalTitle';
import { emptyFunction } from 'src/util/util';

import { CanvasSidebarTestCaseAssertionSchemaEditor_action$key } from './__generated__/CanvasSidebarTestCaseAssertionSchemaEditor_action.graphql';

type Props = {
  actionRef: CanvasSidebarTestCaseAssertionSchemaEditor_action$key;
  assertionSchema: string;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (schema: string) => void;
  readOnly?: boolean;
};

export default function CanvasSidebarTestCaseAssertionSchemaEditor({
  actionRef,
  assertionSchema,
  isOpen,
  onClose,
  onSave = emptyFunction,
  readOnly = false,
}: Props) {
  const action = useFragment(
    graphql`
      fragment CanvasSidebarTestCaseAssertionSchemaEditor_action on Action {
        ...TestCaseAssertionSchemaEditor_action
      }
    `,
    actionRef,
  );

  const title = `${readOnly ? '' : 'Edit '}Assertion Schema`;

  return (
    <DokkimiModal
      isOpen={isOpen}
      toggle={onClose}
      showCloseButton
      showHeaderDivider
      title={<DokkimiModalTitle icon={faFileCode} title={title} />}
    >
      <TestCaseAssertionSchemaEditor
        actionRef={action}
        assertionSchema={assertionSchema}
        readOnly={readOnly}
        onSave={schema => {
          onSave(schema);
          onClose();
        }}
      />
    </DokkimiModal>
  );
}
