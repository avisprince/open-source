import { Button } from '@fluentui/react-components';
import Ajv, { ErrorObject } from 'ajv';
import { useEffect, useState } from 'react';
import { graphql, useFragment } from 'react-relay';

import { CanvasCodeEditor } from 'src/components/canvas/custom';
import { prettifyValue } from 'src/components/canvas/custom/useCodeEditor';
import ActionRequestText from 'src/components/canvas/sidebar/shared/ActionRequestText';
import ActionResponseText from 'src/components/canvas/sidebar/shared/ActionResponseText';
import useActionJSON from 'src/components/canvas/sidebar/tests/hooks/useActionJSON';
import Flexbox from 'src/components/custom/Flexbox';
import { DokkimiColorsV2 } from 'src/components/styles/colors';
import { Stylesheet } from 'src/types/Stylesheet';
import { emptyFunction, isValidJSON, safeJSONparse } from 'src/util/util';

import { TestCaseAssertionSchemaEditor_action$key } from './__generated__/TestCaseAssertionSchemaEditor_action.graphql';

const ajv = new Ajv();

type Props = {
  actionRef: TestCaseAssertionSchemaEditor_action$key;
  assertionSchema: string;
  onSave?: (schema: string) => void;
  readOnly?: boolean;
};

export default function TestCaseAssertionSchemaEditor({
  actionRef,
  assertionSchema,
  onSave = emptyFunction,
  readOnly = false,
}: Props) {
  const action = useFragment(
    graphql`
      fragment TestCaseAssertionSchemaEditor_action on Action {
        type
        ...useActionJSON_action
        ...ActionRequestText_action
        ...ActionResponseText_action
      }
    `,
    actionRef,
  );

  const originalJSON = useActionJSON(action);
  const [json, setJson] = useState(prettifyValue(originalJSON));
  const [schema, setSchema] = useState(prettifyValue(assertionSchema));
  const [validationErrors, setValidationErrors] = useState<
    (ErrorObject | string)[]
  >([]);

  const validateSchema = (schema: string, json: string) => {
    if (!isValidJSON(schema)) {
      setValidationErrors(['schema is invalid: Invalid JSON Object']);
      return;
    }

    try {
      const validate = ajv.compile(JSON.parse(schema));
      validate(safeJSONparse(json));
      setValidationErrors(validate.errors ?? []);
      // eslint-disable-next-line
    } catch (e: any) {
      setValidationErrors([e.message.toString()]);
    }
  };

  const onChange = (val: string) => {
    setSchema(val);
  };

  useEffect(() => {
    setSchema(prettifyValue(assertionSchema));
  }, [assertionSchema]);

  useEffect(() => {
    setJson(prettifyValue(originalJSON));
  }, [originalJSON]);

  useEffect(() => {
    validateSchema(schema, json);
  }, [schema, json]);

  return (
    <Flexbox direction="column" fullHeight fullWidth>
      <Flexbox direction="column" gap={16} style={styles.header}>
        <Flexbox alignItems="center" justifyContent="space-between">
          <div style={styles.headerTitle}>
            {action.type === 'request' ? (
              <ActionRequestText actionRef={action} />
            ) : (
              <ActionResponseText actionRef={action} />
            )}
          </div>
          {!readOnly && (
            <Button
              appearance="primary"
              size="small"
              onClick={() => onSave(schema)}
            >
              Save
            </Button>
          )}
        </Flexbox>
        {Boolean(validationErrors.length) && (
          <Flexbox direction="column" gap={4} style={styles.errorContainer}>
            <div style={styles.headerTitle}>Validation Errors:</div>
            <div>{JSON.stringify(validationErrors)}</div>
          </Flexbox>
        )}
      </Flexbox>
      <Flexbox style={styles.editorContainer} gap={16}>
        <CanvasCodeEditor
          pointerEvents="auto"
          title="Assertion Schema"
          language="json"
          value={schema}
          height={468}
          onChange={onChange}
          hideExpand
          readOnly={readOnly}
        />
        <CanvasCodeEditor
          pointerEvents="auto"
          title="Test Data"
          language="json"
          value={json}
          height={468}
          onChange={setJson}
          hideExpand
        />
      </Flexbox>
    </Flexbox>
  );
}

const styles = {
  editorContainer: {
    height: 500,
    padding: 16,
  },
  errorContainer: {
    padding: 16,
    backgroundColor: DokkimiColorsV2.blackQuaternary,
    borderRadius: 4,
    border: `1px solid ${DokkimiColorsV2.accentPrimary}`,
  },
  header: {
    padding: 16,
    paddingBottom: 0,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
} satisfies Stylesheet;
