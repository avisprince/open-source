import { useCallback } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import {
  CanvasCodeEditor,
  CanvasInput,
  CanvasSelect,
} from 'src/components/canvas/custom';
import useAutoSaveForm from 'src/components/canvas/hooks/useAutoSaveForm';
import Flexbox from 'src/components/custom/Flexbox';
import { HTTP_METHODS } from 'src/types/HttpMethods';
import { Stylesheet } from 'src/types/Stylesheet';

import { MockEndpointInput } from '../relay/__generated__/useUpdateNamespaceItemMutation.graphql';
import {
  MockEndpointForm_mockEndpointBase$data,
  MockEndpointForm_mockEndpointBase$key,
} from './__generated__/MockEndpointForm_mockEndpointBase.graphql';

type Props = {
  mockEndpointRef: MockEndpointForm_mockEndpointBase$key;
  pointerEvents: 'auto' | 'none';
  onUpdate: (mockEndpoint: MockEndpointInput) => void;
};

export default function MockEndpointForm({
  mockEndpointRef,
  pointerEvents,
  onUpdate,
}: Props) {
  const mockEndpoint = useFragment(
    graphql`
      fragment MockEndpointForm_mockEndpointBase on MockEndpointBase {
        displayName
        method
        origin
        target
        path
        delayMS
        responseStatus
        responseHeaders
        responseBody
        updatedAt
      }
    `,
    mockEndpointRef,
  );

  const update = useCallback(
    async (data: MockEndpointForm_mockEndpointBase$data) => {
      if (data.displayName) {
        await onUpdate({
          ...mockEndpoint,
          displayName: data.displayName,
          method: data.method ?? 'GET',
          origin: data.origin,
          target: data.target,
          path: data.path,
          delayMS: data.delayMS,
          responseStatus: data.responseStatus,
          responseHeaders: data.responseHeaders,
          responseBody: data.responseBody,
          updatedAt: data.updatedAt,
        });
      }
    },
    [mockEndpoint, onUpdate],
  );

  const [fields, handleFieldChange] =
    useAutoSaveForm<MockEndpointForm_mockEndpointBase$data>(
      mockEndpoint,
      update,
    );

  const handleNumberInput = (
    e: React.ChangeEvent<HTMLInputElement>,
  ): number | undefined => {
    const val = e.target.value.replace(/\D/g, '');
    const num = parseInt(val, 10);
    return isNaN(num) ? undefined : num;
  };

  return (
    <Flexbox
      alignItems="start"
      direction="column"
      gap={16}
      grow={1}
      style={styles.inputSection}
    >
      <CanvasInput
        pointerEvents={pointerEvents}
        placeholder="Name"
        value={fields.displayName}
        onChange={e => handleFieldChange('displayName', e.target.value)}
        style={styles.fullWidthInput}
      />
      <Flexbox gap={16} fullWidth>
        <CanvasSelect
          pointerEvents={pointerEvents}
          onChange={e => handleFieldChange('method', e.target.value)}
          value={fields.method ?? 'GET'}
          style={styles.methodSelect}
        >
          {HTTP_METHODS.map((method, index) => (
            <option key={index} value={method}>
              {method}
            </option>
          ))}
        </CanvasSelect>
        <CanvasInput
          pointerEvents={pointerEvents}
          placeholder="Delay (ms)"
          value={fields.delayMS?.toString() ?? ''}
          onChange={e => handleFieldChange('delayMS', handleNumberInput(e))}
          style={styles.delayInput}
        />
        <CanvasInput
          pointerEvents={pointerEvents}
          placeholder="Response Status"
          value={fields.responseStatus?.toString() ?? ''}
          onChange={e =>
            handleFieldChange('responseStatus', handleNumberInput(e))
          }
          style={styles.responseStatusInput}
        />
      </Flexbox>
      <Flexbox gap={16} fullWidth>
        <CanvasInput
          pointerEvents={pointerEvents}
          placeholder="Origin"
          value={fields.origin ?? ''}
          onChange={e => handleFieldChange('origin', e.target.value)}
          style={styles.fullWidthInput}
        />
        <CanvasInput
          pointerEvents={pointerEvents}
          placeholder="Target"
          value={fields.target ?? ''}
          onChange={e => handleFieldChange('target', e.target.value)}
          style={styles.fullWidthInput}
        />
      </Flexbox>
      <CanvasInput
        pointerEvents={pointerEvents}
        placeholder="Path"
        value={fields.path ?? ''}
        onChange={e => handleFieldChange('path', e.target.value)}
        style={styles.fullWidthInput}
      />
      <CanvasCodeEditor
        pointerEvents={pointerEvents}
        title="Response Headers"
        height={200}
        value={fields.responseHeaders ?? ''}
        onChange={val => handleFieldChange('responseHeaders', val)}
      />
      <CanvasCodeEditor
        pointerEvents={pointerEvents}
        title="Response Body"
        height={200}
        value={fields.responseBody ?? ''}
        onChange={val => handleFieldChange('responseBody', val)}
      />
    </Flexbox>
  );
}

const styles = {
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
