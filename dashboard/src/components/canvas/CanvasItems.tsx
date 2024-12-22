import { graphql, useFragment } from 'react-relay';

import CanvasQuery from 'src/components/canvas/CanvasQuery';
import CanvasTraffic from 'src/components/canvas/CanvasTraffic';
import CanvasDatabaseDetails from 'src/components/canvas/itemDetails/CanvasDatabaseDetails';
import CanvasDbQueryDetails from 'src/components/canvas/itemDetails/CanvasDbQueryDetails';
import CanvasHttpRequestDetails from 'src/components/canvas/itemDetails/CanvasHttpRequestDetails';
import CanvasMockEndpointDetails from 'src/components/canvas/itemDetails/CanvasMockEndpointDetails';
import CanvasServiceDetails from 'src/components/canvas/itemDetails/CanvasServiceDetails';

import { CanvasItems_namespaceItems$key } from './__generated__/CanvasItems_namespaceItems.graphql';
import { CanvasItems_query$key } from './__generated__/CanvasItems_query.graphql';

type Props = {
  queryRef: CanvasItems_query$key;
};

export default function CanvasItems({ queryRef }: Props) {
  const { namespace, orgSecrets, orgDbInitFiles } = useFragment(
    graphql`
      fragment CanvasItems_query on Query
      @argumentDefinitions(
        organizationId: { type: "ID!" }
        namespaceId: { type: "ID!" }
      ) {
        namespace(namespaceId: $namespaceId) {
          type
          items {
            ...CanvasItems_namespaceItems
          }
          services {
            ...CanvasMockEndpointDetails_services
          }
          ...CanvasHttpRequestDetails_namespace
          ...CanvasDbQueryDetails_namespace
          ...CanvasTraffic_namespace
          ...CanvasQuery_namespace
        }
        orgSecrets(organizationId: $organizationId) {
          ...CanvasServiceDetails_secrets
        }
        orgDbInitFiles(organizationId: $organizationId) {
          ...CanvasDatabaseDetails_initFiles
        }
      }
    `,
    queryRef,
  );

  const items = useFragment<CanvasItems_namespaceItems$key>(
    graphql`
      fragment CanvasItems_namespaceItems on NamespaceItem
      @relay(plural: true) {
        __typename
        itemId
        ... on Service {
          ...CanvasServiceDetails_service
        }
        ... on Database {
          ...CanvasDatabaseDetails_database
        }
        ... on HttpRequest {
          ...CanvasHttpRequestDetails_httpRequest
        }
        ... on MockEndpoint {
          ...CanvasMockEndpointDetails_mockEndpoint
        }
        ... on DbQuery {
          ...CanvasDbQueryDetails_dbQuery
        }
        ... on TrafficHistory {
          ...CanvasTraffic_trafficHistory
        }
        ... on QueryHistory {
          ...CanvasQuery_queryHistory
        }
      }
    `,
    namespace.items,
  );

  const isDisabled = namespace.type === 'testRun';

  return (
    <>
      {items.map(item => {
        switch (item.__typename) {
          case 'Service': {
            return (
              <CanvasServiceDetails
                serviceRef={item}
                secretsRef={orgSecrets}
                key={item.itemId}
                isDisabled={isDisabled}
              />
            );
          }
          case 'Database': {
            return (
              <CanvasDatabaseDetails
                databaseRef={item}
                initFilesRef={orgDbInitFiles}
                key={item.itemId}
                isDisabled={isDisabled}
              />
            );
          }
          case 'HttpRequest': {
            return (
              <CanvasHttpRequestDetails
                httpRequestRef={item}
                namespaceRef={namespace}
                key={item.itemId}
              />
            );
          }
          case 'MockEndpoint': {
            return (
              <CanvasMockEndpointDetails
                mockEndpointRef={item}
                servicesRef={namespace.services}
                key={item.itemId}
              />
            );
          }
          case 'DbQuery': {
            return (
              <CanvasDbQueryDetails
                dbQueryRef={item}
                namespaceRef={namespace}
                key={item.itemId}
              />
            );
          }
          case 'TrafficHistory': {
            return (
              <CanvasTraffic
                trafficHistoryRef={item}
                namespaceRef={namespace}
                key={item.itemId}
              />
            );
          }
          case 'QueryHistory': {
            return (
              <CanvasQuery
                queryHistoryRef={item}
                namespaceRef={namespace}
                key={item.itemId}
              />
            );
          }
          default: {
            return null;
          }
        }
      })}
    </>
  );
}
