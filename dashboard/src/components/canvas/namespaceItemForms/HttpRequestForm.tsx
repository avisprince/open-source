import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';

import {
  CanvasCodeEditor,
  CanvasInput,
  CanvasSelect,
} from 'src/components/canvas/custom';
import useAutoSaveForm from 'src/components/canvas/hooks/useAutoSaveForm';
import Flexbox from 'src/components/custom/Flexbox';
import { DokkimiColors } from 'src/components/styles/colors';
import stylist from 'src/components/styles/stylist';
import { HTTP_METHODS } from 'src/types/HttpMethods';
import { Stylesheet } from 'src/types/Stylesheet';

import { useSendRequestToNamespaceMutation$data } from '../relay/__generated__/useSendRequestToNamespaceMutation.graphql';
import { HttpRequestInput } from '../relay/__generated__/useUpdateNamespaceItemMutation.graphql';
import {
  HttpRequestForm_httpRequestBase$data,
  HttpRequestForm_httpRequestBase$key,
} from './__generated__/HttpRequestForm_httpRequestBase.graphql';
import { HttpRequestForm_services$key } from './__generated__/HttpRequestForm_services.graphql';

type Props = {
  httpRequestRef: HttpRequestForm_httpRequestBase$key;
  servicesRef: HttpRequestForm_services$key;
  pointerEvents: 'auto' | 'none';
  actionType: 'request' | 'response';
  onlyShowRequest?: boolean;
  result?:
    | useSendRequestToNamespaceMutation$data['sendRequestToNamespace']
    | null;
  onUpdate: (httpRequest: HttpRequestInput) => void;
  setActionType: (actionType: 'request' | 'response') => void;
};

export default function HttpRequestForm({
  httpRequestRef,
  servicesRef,
  pointerEvents,
  actionType,
  onlyShowRequest,
  result,
  onUpdate,
  setActionType,
}: Props) {
  const httpRequest = useFragment(
    graphql`
      fragment HttpRequestForm_httpRequestBase on HttpRequestBase {
        displayName
        method
        target
        path
        headers
        body
        updatedAt
      }
    `,
    httpRequestRef,
  );

  const services = useFragment(
    graphql`
      fragment HttpRequestForm_services on Service @relay(plural: true) {
        itemId
        displayName
      }
    `,
    servicesRef,
  );

  const update = useCallback(
    async (data: HttpRequestForm_httpRequestBase$data) => {
      if (data.displayName) {
        await onUpdate({
          displayName: data.displayName,
          method: data.method ?? 'GET',
          target: data.target,
          path: data.path,
          headers: data.headers,
          body: data.body,
          updatedAt: data.updatedAt,
        });
      }
    },
    [onUpdate],
  );

  const [fields, handleFieldChange] =
    useAutoSaveForm<HttpRequestForm_httpRequestBase$data>(httpRequest, update);

  return (
    <Flexbox
      alignItems="start"
      direction="column"
      gap={16}
      grow={1}
      style={styles.content}
    >
      <CanvasInput
        pointerEvents={pointerEvents}
        placeholder="Name"
        value={fields.displayName}
        onChange={e => handleFieldChange('displayName', e.target.value)}
        style={styles.pathInput}
      />
      <Flexbox gap={16} fullWidth>
        <CanvasSelect
          pointerEvents={pointerEvents}
          onChange={e => handleFieldChange('method', e.target.value)}
          value={fields.method ?? 'GET'}
        >
          {HTTP_METHODS.map((method, index) => (
            <option key={index} value={method}>
              {method}
            </option>
          ))}
        </CanvasSelect>
        <CanvasSelect
          pointerEvents={pointerEvents}
          onChange={e => handleFieldChange('target', e.target.value)}
          value={fields.target ?? ''}
          style={{ flexGrow: 1 }}
        >
          <option value="">Select Target</option>
          {services.map((service, index) => (
            <option key={index} value={service.itemId}>
              {service.displayName}
            </option>
          ))}
        </CanvasSelect>
      </Flexbox>
      <CanvasInput
        pointerEvents={pointerEvents}
        placeholder="Path"
        value={fields.path ?? ''}
        onChange={e => handleFieldChange('path', e.target.value)}
        style={styles.pathInput}
      />
      {!onlyShowRequest && (
        <Flexbox alignItems="center" fullWidth gap={4}>
          <div
            style={stylist([
              styles.tab,
              { pointerEvents },
              actionType === 'request' ? styles.selectedTab : {},
            ])}
            onClick={() => setActionType('request')}
          >
            Request
          </div>
          <div
            style={stylist([
              styles.tab,
              { pointerEvents },
              actionType === 'response' ? styles.selectedTab : {},
            ])}
            onClick={() => setActionType('response')}
          >
            Response
          </div>
        </Flexbox>
      )}
      {actionType === 'response' && !!result && (
        <Flexbox alignItems="center" justifyContent="start" fullWidth>
          <div>Status: {result.status}</div>
        </Flexbox>
      )}
      {actionType === 'request' && (
        <>
          <div style={{ width: '100%' }}>
            <CanvasCodeEditor
              pointerEvents={pointerEvents}
              title="Request Headers"
              height={180}
              value={fields.headers ?? ''}
              onChange={val => handleFieldChange('headers', val)}
            />
          </div>
          <div style={{ width: '100%' }}>
            <CanvasCodeEditor
              pointerEvents={pointerEvents}
              title="Request Body"
              height={240}
              value={fields.body ?? ''}
              onChange={val => handleFieldChange('body', val)}
            />
          </div>
        </>
      )}
      {actionType === 'response' && (
        <>
          <CanvasCodeEditor
            pointerEvents={pointerEvents}
            title="Response Headers"
            height={180}
            value={JSON.stringify(result?.headers ?? '')}
            readOnly
          />
          <CanvasCodeEditor
            pointerEvents={pointerEvents}
            title="Response Body"
            height={240}
            value={JSON.stringify(result?.data ?? '')}
            readOnly
          />
        </>
      )}
    </Flexbox>
  );
}

const styles = {
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
