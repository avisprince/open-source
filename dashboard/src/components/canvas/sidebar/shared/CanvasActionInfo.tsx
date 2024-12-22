import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { CanvasCodeEditor } from 'src/components/canvas/custom';
import ActionRequestText from 'src/components/canvas/sidebar/shared/ActionRequestText';
import { ActionIdentifier } from 'src/components/canvas/sidebar/shared/types';
import Flexbox from 'src/components/custom/Flexbox';
import ToggleButton from 'src/components/custom/ToggleButton';
import { DokkimiColorsV2 } from 'src/components/styles/colors';
import { getStatusCodeColor } from 'src/types/HttpMethods';

import { CanvasActionInfo_actionRequest$key } from './__generated__/CanvasActionInfo_actionRequest.graphql';
import { CanvasActionInfo_actionResponse$key } from './__generated__/CanvasActionInfo_actionResponse.graphql';

type Props = {
  actionIdentifier: ActionIdentifier | null;
  actionRequestRef: CanvasActionInfo_actionRequest$key | null;
  actionResponseRef: CanvasActionInfo_actionResponse$key | null;
};

export default function CanvasActionInfo({
  actionIdentifier,
  actionRequestRef,
  actionResponseRef,
}: Props) {
  const styles = useStyles();
  const [actionType, setActionType] = useState<'request' | 'response'>(
    'response',
  );

  const actionRequest = useFragment(
    graphql`
      fragment CanvasActionInfo_actionRequest on Action {
        id
        timestamp
        headers
        body
        originDomain
        ...ActionRequestText_action
      }
    `,
    actionRequestRef,
  );

  const actionResponse = useFragment(
    graphql`
      fragment CanvasActionInfo_actionResponse on Action {
        id
        timestamp
        status
        headers
        body
      }
    `,
    actionResponseRef,
  );

  useEffect(() => {
    setActionType(
      actionRequest?.id === actionIdentifier?.id ? 'request' : 'response',
    );
  }, [actionRequest, actionIdentifier, setActionType]);

  if (!actionRequest) {
    return null;
  }

  const isRequest = actionType === 'request';
  const action = isRequest ? actionRequest : actionResponse;
  const headers = isRequest ? actionRequest.headers : actionResponse?.headers;
  const body = isRequest ? actionRequest.body : actionResponse?.body;
  const originDomain = actionRequest.originDomain;

  return (
    <Flexbox direction="column" fullWidth className={styles.content} gap={16}>
      <Flexbox direction="column" gap={4}>
        <ActionRequestText
          actionRef={actionRequest}
          style={{ fontSize: 16 }}
          longMethodName
        />
        <div className={styles.origin}>(From: {originDomain})</div>
      </Flexbox>
      <Flexbox direction="column" gap={8}>
        <Flexbox alignItems="center" fullWidth gap={4}>
          <ToggleButton
            isSelected={isRequest}
            onClick={() => setActionType('request')}
            text="Request"
          />
          <ToggleButton
            isSelected={!isRequest}
            onClick={() => setActionType('response')}
            text="Response"
          />
        </Flexbox>
        <Flexbox alignItems="center" justifyContent="space-between" fullWidth>
          {actionType === 'response' ? (
            <Flexbox alignItems="center" justifyContent="start" gap={4}>
              <div>Status:</div>
              <Flexbox
                alignItems="center"
                justifyContent="center"
                className={styles.requestMethod}
                style={{
                  backgroundColor: getStatusCodeColor(
                    actionResponse?.status ?? 200,
                  ),
                }}
              >
                {actionResponse?.status}
              </Flexbox>
            </Flexbox>
          ) : (
            <div />
          )}
          <Flexbox justifyContent="end">
            {dayjs(action?.timestamp).format('MM/DD/YYYY h:mm a')}
          </Flexbox>
        </Flexbox>
        <CanvasCodeEditor
          title="Headers"
          height={160}
          value={headers ?? ''}
          readOnly
        />
        <CanvasCodeEditor
          title="Body"
          height={180}
          value={body ?? ''}
          readOnly
        />
      </Flexbox>
    </Flexbox>
  );
}

const useStyles = createUseStyles({
  content: {
    padding: '16px 16px 20px',
  },
  origin: {
    fontSize: 12,
  },
  requestMethod: {
    width: 32,
    padding: '1px 2px',
    color: DokkimiColorsV2.white,
    borderRadius: 4,
  },
});
