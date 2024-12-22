import { createUseStyles } from 'react-jss';
import { graphql, useFragment } from 'react-relay';

import Flexbox from 'src/components/custom/Flexbox';
import { DokkimiColorsV2 } from 'src/components/styles/colors';
import { getStatusCodeColor } from 'src/types/HttpMethods';
import { emptyFunction } from 'src/util/util';

import { ActionResponseText_action$key } from './__generated__/ActionResponseText_action.graphql';

type Props = {
  actionRef: ActionResponseText_action$key;
  onClick?: () => void;
  style?: React.CSSProperties;
};

export default function ActionRequestText({
  actionRef,
  onClick = emptyFunction,
  style,
}: Props) {
  const styles = useStyles();

  const action = useFragment(
    graphql`
      fragment ActionResponseText_action on Action {
        status
        originDomain
        url
      }
    `,
    actionRef,
  );

  const url = `${action.originDomain}${action.url}`;
  const backgroundColor = getStatusCodeColor(action.status);

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
        style={{ backgroundColor }}
      >
        {action.status}
      </Flexbox>
      <div className={styles.requestUrl}>{url}</div>
    </Flexbox>
  );
}

const useStyles = createUseStyles({
  requestMethod: {
    width: 32,
    padding: '1px 2px',
    color: DokkimiColorsV2.white,
    borderRadius: 4,
  },
  requestUrl: {
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
});
