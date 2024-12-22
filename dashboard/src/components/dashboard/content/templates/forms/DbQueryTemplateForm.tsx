import { Button, Input, Select } from '@fluentui/react-components';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { CanvasCodeEditor } from 'src/components/canvas/custom';
import Flexbox from 'src/components/custom/Flexbox';
import useForm from 'src/components/dashboard/content/templates/forms/useForm';
import { useUpdateTemplate } from 'src/components/dashboard/content/templates/hooks/useUpdateTemplate';
import { Stylesheet } from 'src/types/Stylesheet';

import {
  DbQueryTemplateForm_dbQueryBase$data,
  DbQueryTemplateForm_dbQueryBase$key,
} from './__generated__/DbQueryTemplateForm_dbQueryBase.graphql';

type Props = {
  dbQueryRef: DbQueryTemplateForm_dbQueryBase$key;
  templateId: string;
  isDisabled: boolean;
  onSave: () => void;
};

export default function DbQueryForm({
  dbQueryRef,
  templateId,
  isDisabled,
  onSave,
}: Props) {
  const dbQuery = useFragment(
    graphql`
      fragment DbQueryTemplateForm_dbQueryBase on DbQueryBase {
        displayName
        target
        query
        useDatabase
      }
    `,
    dbQueryRef,
  );

  const [fields, handleFieldChange] =
    useForm<DbQueryTemplateForm_dbQueryBase$data>(dbQuery);

  const [updateTemplate] = useUpdateTemplate(templateId);
  const onClickSave = async () => {
    if (fields.displayName) {
      await updateTemplate({
        itemType: 'DbQuery',
        dbQuery: {
          displayName: fields.displayName,
          target: fields.target,
          query: fields.query,
          useDatabase: fields.useDatabase,
        },
      });
      onSave();
    }
  };

  return (
    <Flexbox
      alignItems="center"
      justifyContent="center"
      direction="column"
      gap={16}
    >
      <Flexbox direction="column" fullWidth style={styles.container}>
        <Flexbox
          alignItems="start"
          direction="column"
          gap={16}
          style={styles.content}
        >
          <Input
            placeholder="Name"
            value={fields.displayName}
            onChange={e => handleFieldChange('displayName', e.target.value)}
            style={styles.fullWidthInput}
            disabled={isDisabled}
          />
          <Select
            onChange={e => handleFieldChange('target', e.target.value)}
            value={fields.target ?? ''}
            style={styles.fullWidthInput}
            disabled={isDisabled}
          >
            <option value="">Select Target Database</option>
          </Select>
          <Input
            placeholder="Use Database"
            value={fields.useDatabase ?? ''}
            onChange={e => handleFieldChange('useDatabase', e.target.value)}
            style={styles.fullWidthInput}
            disabled={isDisabled}
          />
          <CanvasCodeEditor
            pointerEvents="auto"
            title="Query"
            height={200}
            value={fields.query ?? ''}
            onChange={val => handleFieldChange('query', val)}
            readOnly={isDisabled}
          />
        </Flexbox>
      </Flexbox>
      <Button
        appearance="primary"
        onClick={onClickSave}
        disabled={isDisabled || !fields.displayName}
      >
        Save
      </Button>
    </Flexbox>
  );
}

const styles = {
  container: {
    border: '1px solid #494949',
    borderRadius: 4,
  },
  content: {
    padding: 16,
  },
  fullWidthInput: {
    width: '100%',
  },
} satisfies Stylesheet;
