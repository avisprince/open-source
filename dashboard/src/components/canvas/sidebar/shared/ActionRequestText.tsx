import { createUseStyles } from 'react-jss';
import { graphql, useFragment } from 'react-relay';

import Flexbox from 'src/components/custom/Flexbox';
import { HTTP_METHOD_COLORS, HTTP_METHOD_NAMES } from 'src/types/HttpMethods';
import { emptyFunction } from 'src/util/util';

import { ActionRequestText_action$key } from './__generated__/ActionRequestText_action.graphql';

type Props = {
  actionRef: ActionRequestText_action$key;
  onClick?: () => void;
  style?: React.CSSProperties;
  longMethodName?: boolean;
};

export default function ActionRequestText({
  actionRef,
  onClick = emptyFunction,
  style,
  longMethodName,
}: Props) {
  const styles = useStyles();

  const action = useFragment(
    graphql`
      fragment ActionRequestText_action on Action {
        method
        targetDomain
        url
      }
    `,
    actionRef,
  );

  const url = `${action.targetDomain}${action.url}`;
  const color = HTTP_METHOD_COLORS[action.method] ?? 'yellow';

  return (
    <Flexbox
      fullWidth
      alignItems="center"
      gap={8}
      onClick={onClick}
      style={{ ...style }}
    >
      <Flexbox
        alignItems="center"
        justifyContent="center"
        className={styles.requestMethod}
        style={{ color, width: longMethodName ? 'auto' : 32 }}
      >
        {longMethodName ? action.method : HTTP_METHOD_NAMES[action.method]}
      </Flexbox>
      <div className={styles.requestUrl}>{url}</div>
    </Flexbox>
  );
}

const useStyles = createUseStyles({
  requestMethod: {
    textTransform: 'uppercase',
  },
  requestUrl: {
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
});
