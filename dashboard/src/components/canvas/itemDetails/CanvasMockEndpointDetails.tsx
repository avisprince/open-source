import { faDiamond } from '@fortawesome/free-solid-svg-icons';
import { useMemo } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import CanvasArrow from 'src/components/canvas/CanvasArrow';
import CanvasItem from 'src/components/canvas/CanvasItem';
import usePointerEvents from 'src/components/canvas/custom/usePointerEvents';
import MockEndpointForm from 'src/components/canvas/namespaceItemForms/MockEndpointForm';
import { useUpdateNamespaceItem } from 'src/components/canvas/relay/useUpdateNamespaceItem';
import useDebounce from 'src/hooks/useDebounce';

import { CanvasArrow_namespaceItem$key } from '../__generated__/CanvasArrow_namespaceItem.graphql';
import { MockEndpointInput } from '../relay/__generated__/useUpdateNamespaceItemMutation.graphql';
import { CanvasMockEndpointDetails_mockEndpoint$key } from './__generated__/CanvasMockEndpointDetails_mockEndpoint.graphql';
import { CanvasMockEndpointDetails_services$key } from './__generated__/CanvasMockEndpointDetails_services.graphql';

type Props = {
  mockEndpointRef: CanvasMockEndpointDetails_mockEndpoint$key;
  servicesRef: CanvasMockEndpointDetails_services$key;
};

export default function CanvasMockEndpointDetails({
  mockEndpointRef,
  servicesRef,
}: Props) {
  const mockEndpoint = useFragment(
    graphql`
      fragment CanvasMockEndpointDetails_mockEndpoint on MockEndpoint {
        itemId
        target
        origin
        ...CanvasArrow_namespaceItem
        ...CanvasItem_namespaceItem
        ...MockEndpointForm_mockEndpointBase
      }
    `,
    mockEndpointRef,
  );

  const services = useFragment(
    graphql`
      fragment CanvasMockEndpointDetails_services on Service
      @relay(plural: true) {
        domain
        ...CanvasArrow_namespaceItem
      }
    `,
    servicesRef,
  );

  const pointerEvents = usePointerEvents();
  const [updateItem] = useUpdateNamespaceItem();
  const debouncedUpdate = useDebounce(updateItem, 300);

  const onUpdate = async (updatedMockEndpoint: MockEndpointInput) => {
    await debouncedUpdate({
      itemType: 'MockEndpoint',
      mockEndpoint: {
        itemId: mockEndpoint.itemId,
        ...updatedMockEndpoint,
      },
    });
  };

  const arrows = useMemo(() => {
    const nodes: Array<
      [
        node1: CanvasArrow_namespaceItem$key,
        node2: CanvasArrow_namespaceItem$key,
      ]
    > = [];

    services.forEach(service => {
      if (
        mockEndpoint.origin === '*' ||
        mockEndpoint.origin === service.domain
      ) {
        nodes.push([service, mockEndpoint]);
      }

      if (
        mockEndpoint.target === '*' ||
        mockEndpoint.target === service.domain
      ) {
        nodes.push([mockEndpoint, service]);
      }
    });

    return nodes;
  }, [services, mockEndpoint]);

  return (
    <>
      <CanvasItem namespaceItemRef={mockEndpoint} icon={faDiamond}>
        <MockEndpointForm
          key={mockEndpoint.itemId}
          mockEndpointRef={mockEndpoint}
          pointerEvents={pointerEvents}
          onUpdate={onUpdate}
        />
      </CanvasItem>
      {arrows.map(([node1, node2], i) => (
        <CanvasArrow key={i} node1Ref={node1} node2Ref={node2} />
      ))}
    </>
  );
}
