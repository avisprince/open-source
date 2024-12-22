import { Button, Input, Select } from '@fluentui/react-components';
import { graphql, useFragment } from 'react-relay';

import { CanvasCodeEditor } from 'src/components/canvas/custom';
import Flexbox from 'src/components/custom/Flexbox';
import { useUpdateTemplate } from 'src/components/dashboard/content/templates/hooks/useUpdateTemplate';
import { DokkimiColors } from 'src/components/styles/colors';
import { HTTP_METHODS } from 'src/types/HttpMethods';
import { Stylesheet } from 'src/types/Stylesheet';

import {
  HttpRequestTemplateForm_httpRequestBase$data,
  HttpRequestTemplateForm_httpRequestBase$key,
} from './__generated__/HttpRequestTemplateForm_httpRequestBase.graphql';
import useForm from './useForm';

type Props = {
  httpRequestRef: HttpRequestTemplateForm_httpRequestBase$key;
  templateId: string;
  isDisabled: boolean;
  onSave: () => void;
};

export default function HttpRequestTemplateForm({
  httpRequestRef,
  templateId,
  isDisabled,
  onSave,
}: Props) {
  const httpRequest = useFragment(
    graphql`
      fragment HttpRequestTemplateForm_httpRequestBase on HttpRequestBase {
        displayName
        method
        target
        path
        headers
        body
      }
    `,
    httpRequestRef,
  );

  const [fields, handleFieldChange] =
    useForm<HttpRequestTemplateForm_httpRequestBase$data>(httpRequest);

  const [updateTemplate] = useUpdateTemplate(templateId);
  const onClickSave = async () => {
    if (fields.displayName) {
      await updateTemplate({
        itemType: 'HttpRequest',
        httpRequest: {
          displayName: fields.displayName,
          method: fields.method ?? 'GET',
          target: fields.target,
          path: fields.path,
          headers: fields.headers,
          body: fields.body,
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
          grow={1}
          style={styles.content}
        >
          <Input
            placeholder="Name"
            value={fields.displayName}
            onChange={e => handleFieldChange('displayName', e.target.value)}
            style={styles.pathInput}
            disabled={isDisabled}
          />
          <Flexbox gap={16} fullWidth>
            <Select
              onChange={e => handleFieldChange('method', e.target.value)}
              value={fields.method ?? 'GET'}
              disabled={isDisabled}
            >
              {HTTP_METHODS.map((method, index) => (
                <option key={index} value={method}>
                  {method}
                </option>
              ))}
            </Select>
            <Select
              onChange={e => handleFieldChange('target', e.target.value)}
              value={fields.target ?? ''}
              style={{ flexGrow: 1 }}
              disabled={isDisabled}
            >
              <option value="">Select Target</option>
            </Select>
          </Flexbox>
          <Input
            placeholder="Path"
            value={fields.path ?? ''}
            onChange={e => handleFieldChange('path', e.target.value)}
            style={styles.pathInput}
            disabled={isDisabled}
          />
          <>
            <div style={{ width: '100%' }}>
              <CanvasCodeEditor
                title="Request Headers"
                height={180}
                value={fields.headers ?? ''}
                onChange={val => handleFieldChange('headers', val)}
                pointerEvents="auto"
                readOnly={isDisabled}
              />
            </div>
            <div style={{ width: '100%' }}>
              <CanvasCodeEditor
                title="Request Body"
                height={240}
                value={fields.body ?? ''}
                onChange={val => handleFieldChange('body', val)}
                pointerEvents="auto"
                readOnly={isDisabled}
              />
            </div>
          </>
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
  pathInput: {
    width: '100%',
  },
  title: {
    marginBottom: 8,
  },
  tab: {
    flexGrow: 1,
    marginBottom: 4,
    padding: '6px 4px',
    backgroundColor: DokkimiColors.defaultBackgroundColor,
    border: `1px solid ${DokkimiColors.tertiaryBackgroundColor}`,
    borderRadius: 4,
    textAlign: 'center',
    cursor: 'pointer',
    userSelect: 'none',
  },
  selectedTab: {
    backgroundColor: DokkimiColors.blackBackgroundColor,
    border: `1px solid ${DokkimiColors.blackBorderColor}`,
    borderBottomColor: DokkimiColors.accentBackgroundColor,
  },
} satisfies Stylesheet;
