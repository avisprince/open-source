import { ExecutionResult, Sink, createClient } from 'graphql-ws';
import { ReactElement, ReactNode, useMemo } from 'react';
import { RelayEnvironmentProvider } from 'react-relay';
import {
  Environment,
  Network,
  Observable,
  RecordSource,
  Store,
} from 'relay-runtime';
import type {
  FetchFunction,
  IEnvironment,
  PayloadData,
  SubscribeFunction,
} from 'relay-runtime';
import { PayloadExtensions } from 'relay-runtime/lib/network/RelayNetworkTypes';

import { getAccessToken } from 'src/services/localStorage.service';

const fetchFn: FetchFunction = (params, variables) => {
  const accessToken = getAccessToken();

  const response = fetch(`${import.meta.env.VITE_CT_DOMAIN}/graphql`, {
    method: 'POST',
    headers: [
      ['Content-Type', 'application/json'],
      ['Authorization', accessToken ? `Bearer ${accessToken}` : ''],
    ],
    body: JSON.stringify({
      query: params.text,
      variables,
    }),
  });

  return Observable.from(response.then(data => data.json()));
};

const wsClient = createClient({
  url: `${import.meta.env.VITE_CT_WS_DOMAIN}/graphql`,
});

const subscribe: SubscribeFunction = (operation, variables) => {
  return Observable.create(sink => {
    return wsClient.subscribe(
      {
        operationName: operation.name,
        query: operation.text ?? '',
        variables,
      },
      sink as Sink<ExecutionResult<PayloadData, PayloadExtensions>>,
    );
  });
};

function createEnvironment(): IEnvironment {
  const network = Network.create(fetchFn, subscribe);
  const store = new Store(new RecordSource());
  return new Environment({ store, network });
}

export default function RelayEnvironment({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  const environment = useMemo(() => {
    return createEnvironment();
  }, []);

  return (
    <RelayEnvironmentProvider environment={environment}>
      {children}
    </RelayEnvironmentProvider>
  );
}
