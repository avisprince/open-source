import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';

import { safeJSONparse } from 'src/util/util';

import { useActionJSON_action$key } from './__generated__/useActionJSON_action.graphql';

export default function useActionJSON(actionRef: useActionJSON_action$key) {
  const action = useFragment(
    graphql`
      fragment useActionJSON_action on Action {
        headers
        body
      }
    `,
    actionRef,
  );

  return useMemo(
    () =>
      JSON.stringify({
        headers: safeJSONparse(action.headers),
        body: safeJSONparse(action.body),
      }),
    [action],
  );
}
