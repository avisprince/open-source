import { Spinner } from '@fluentui/react-components';
import { Send24Filled } from '@fluentui/react-icons';
import { faGlobe } from '@fortawesome/free-solid-svg-icons';
import { useCallback, useMemo, useState } from 'react';
import { graphql, useFragment } from 'react-relay';

import CanvasArrow from 'src/components/canvas/CanvasArrow';
import CanvasItem from 'src/components/canvas/CanvasItem';
import { CanvasButton } from 'src/components/canvas/custom';
import usePointerEvents from 'src/components/canvas/custom/usePointerEvents';
import HttpRequestForm from 'src/components/canvas/namespaceItemForms/HttpRequestForm';
import { useSendRequestToNamespace } from 'src/components/canvas/relay/useSendRequestToNamespace';
import { useUpdateNamespaceItem } from 'src/components/canvas/relay/useUpdateNamespaceItem';
import useDebounce from 'src/hooks/useDebounce';

import { HttpRequestInput } from '../relay/__generated__/useUpdateNamespaceItemMutation.graphql';
import { CanvasHttpRequestDetails_httpRequest$key } from './__generated__/CanvasHttpRequestDetails_httpRequest.graphql';
import { CanvasHttpRequestDetails_namespace$key } from './__generated__/CanvasHttpRequestDetails_namespace.graphql';

type Props = {
  httpRequestRef: CanvasHttpRequestDetails_httpRequest$key;
  namespaceRef: CanvasHttpRequestDetails_namespace$key;
};

export default function CanvasHttpRequestDetails({
  httpRequestRef,
  namespaceRef,
}: Props) {
  const httpRequest = useFragment(
    graphql`
      fragment CanvasHttpRequestDetails_httpRequest on HttpRequest {
        itemId
        target
        ...CanvasArrow_namespaceItem
        ...CanvasItem_namespaceItem
        ...HttpRequestForm_httpRequestBase
      }
    `,
    httpRequestRef,
  );

  const namespace = useFragment(
    graphql`
      fragment CanvasHttpRequestDetails_namespace on Namespace {
        status
        services {
          itemId
          namespaceStatus
          ...CanvasArrow_namespaceItem
          ...HttpRequestForm_services
        }
      }
    `,
    namespaceRef,
  );

  const pointerEvents = usePointerEvents();
  const [updateItem] = useUpdateNamespaceItem();
  const debouncedUpdate = useDebounce(updateItem, 300);
  const [sendRequest, loading, result] = useSendRequestToNamespace(
    httpRequest.itemId,
  );

  const [actionType, setActionType] = useState<'request' | 'response'>(
    'request',
  );

  const onUpdate = (updatedHttpRequest: HttpRequestInput) => {
    debouncedUpdate({
      itemType: 'HttpRequest',
      httpRequest: {
        itemId: httpRequest.itemId,
        ...updatedHttpRequest,
      },
    });
  };

  const onSendRequest = useCallback(() => {
    setActionType('response');
    sendRequest();
  }, [sendRequest]);

  const targetService = useMemo(() => {
    return namespace.services.find(
      service => service.itemId === httpRequest.target,
    );
  }, [namespace.services, httpRequest.target]);

  const arrow = useMemo(() => {
    if (!targetService) {
      return null;
    }

    return <CanvasArrow node1Ref={httpRequest} node2Ref={targetService} />;
  }, [targetService, httpRequest]);

  const sendButton = useMemo(() => {
    if (namespace.status !== 'active') {
      return null;
    }

    if (loading) {
      return <Spinner size="tiny" />;
    }

    return (
      <CanvasButton
        pointerEvents={pointerEvents}
        appearance="primary"
        icon={<Send24Filled />}
        onClick={onSendRequest}
        disabled={targetService?.namespaceStatus !== 'running'}
      />
    );
  }, [
    namespace.status,
    loading,
    pointerEvents,
    targetService?.namespaceStatus,
    onSendRequest,
  ]);

  return (
    <>
      <CanvasItem
        namespaceItemRef={httpRequest}
        icon={faGlobe}
        showHealthIcon={false}
        headerAction={sendButton}
      >
        <HttpRequestForm
          key={httpRequest.itemId}
          httpRequestRef={httpRequest}
          servicesRef={namespace.services}
          pointerEvents={pointerEvents}
          result={result}
          actionType={actionType}
          onUpdate={onUpdate}
          setActionType={setActionType}
        />
      </CanvasItem>
      {arrow}
    </>
  );
}
