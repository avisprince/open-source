import { Button, Input, Select } from '@fluentui/react-components';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { CanvasCodeEditor } from 'src/components/canvas/custom';
import Flexbox from 'src/components/custom/Flexbox';
import useForm from 'src/components/dashboard/content/templates/forms/useForm';
import { HTTP_METHODS } from 'src/types/HttpMethods';
import { Stylesheet } from 'src/types/Stylesheet';

import { useUpdateTemplate } from '../hooks/useUpdateTemplate';
import {
  MockEndpointTemplateForm_mockEndpointBase$data,
  MockEndpointTemplateForm_mockEndpointBase$key,
} from './__generated__/MockEndpointTemplateForm_mockEndpointBase.graphql';

type Props = {
  mockEndpointRef: MockEndpointTemplateForm_mockEndpointBase$key;
  templateId: string;
  isDisabled: boolean;
  onSave: () => void;
};

export default function MockEndpointTemplateForm({
  mockEndpointRef,
  templateId,
  isDisabled,
  onSave,
}: Props) {
  const mockEndpoint = useFragment(
    graphql`
      fragment MockEndpointTemplateForm_mockEndpointBase on MockEndpointBase {
        displayName
        method
        origin
        target
        path
        delayMS
        responseStatus
        responseHeaders
        responseBody
      }
    `,
    mockEndpointRef,
  );

  const [fields, handleFieldChange] =
    useForm<MockEndpointTemplateForm_mockEndpointBase$data>(mockEndpoint);

  const [updateTemplate] = useUpdateTemplate(templateId);
  const onClickSave = async () => {
    if (fields.displayName) {
      await updateTemplate({
        itemType: 'MockEndpoint',
        mockEndpoint: {
          displayName: fields.displayName,
          method: fields.method ?? 'GET',
          origin: fields.origin,
          target: fields.target,
          path: fields.path,
          delayMS: fields.delayMS,
          responseStatus: fields.responseStatus,
          responseHeaders: fields.responseHeaders,
          responseBody: fields.responseBody,
        },
      });
      onSave();
    }
  };

  const handleNumberInput = (
    e: React.ChangeEvent<HTMLInputElement>,
  ): number | null => {
    const val = e.target.value.replace(/\D/g, '');
    const num = parseInt(val, 10);
    return isNaN(num) ? null : num;
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
          grow={1}
          style={styles.inputSection}
        >
          <Input
            placeholder="Name"
            value={fields.displayName}
            onChange={e => handleFieldChange('displayName', e.target.value)}
            style={styles.fullWidthInput}
            disabled={isDisabled}
          />
          <Flexbox gap={16} fullWidth>
            <Select
              onChange={e => handleFieldChange('method', e.target.value)}
              value={fields.method ?? 'GET'}
              style={styles.methodSelect}
              disabled={isDisabled}
            >
              {HTTP_METHODS.map((method, index) => (
                <option key={index} value={method}>
                  {method}
                </option>
              ))}
            </Select>
            <Input
              placeholder="Delay (ms)"
              value={fields.delayMS?.toString() ?? ''}
              onChange={e => handleFieldChange('delayMS', handleNumberInput(e))}
              style={styles.delayInput}
              disabled={isDisabled}
            />
            <Input
              placeholder="Response Status"
              value={fields.responseStatus?.toString() ?? ''}
              onChange={e =>
                handleFieldChange('responseStatus', handleNumberInput(e))
              }
              style={styles.responseStatusInput}
              disabled={isDisabled}
            />
          </Flexbox>
          <Flexbox gap={16} fullWidth>
            <Input
              placeholder="Origin"
              value={fields.origin ?? ''}
              onChange={e => handleFieldChange('origin', e.target.value)}
              style={styles.fullWidthInput}
              disabled={isDisabled}
            />
            <Input
              placeholder="Target"
              value={fields.target ?? ''}
              onChange={e => handleFieldChange('target', e.target.value)}
              style={styles.fullWidthInput}
              disabled={isDisabled}
            />
          </Flexbox>
          <Input
            placeholder="Path"
            value={fields.path ?? ''}
            onChange={e => handleFieldChange('path', e.target.value)}
            style={styles.fullWidthInput}
            disabled={isDisabled}
          />
          <CanvasCodeEditor
            pointerEvents="auto"
            title="Response Headers"
            height={200}
            value={fields.responseHeaders ?? ''}
            onChange={val => handleFieldChange('responseHeaders', val)}
            readOnly={isDisabled}
          />
          <CanvasCodeEditor
            pointerEvents="auto"
            title="Response Body"
            height={200}
            value={fields.responseBody ?? ''}
            onChange={val => handleFieldChange('responseBody', val)}
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
  delayInput: {
    width: 110,
  },
  fullWidthInput: {
    width: '100%',
  },
  inputSection: {
    padding: 16,
  },
  methodSelect: {
    width: 140,
  },
  responseStatusInput: {
    width: 140,
  },
} satisfies Stylesheet;
