import { faMicrochip } from '@fortawesome/free-solid-svg-icons';
import { graphql, useFragment } from 'react-relay';

import CanvasItem from 'src/components/canvas/CanvasItem';
import usePointerEvents from 'src/components/canvas/custom/usePointerEvents';
import ServiceForm from 'src/components/canvas/namespaceItemForms/ServiceForm';
import { useUpdateNamespaceItem } from 'src/components/canvas/relay/useUpdateNamespaceItem';
import useDebounce from 'src/hooks/useDebounce';

import { ServiceInput } from '../relay/__generated__/useUpdateNamespaceItemMutation.graphql';
import { CanvasServiceDetails_secrets$key } from './__generated__/CanvasServiceDetails_secrets.graphql';
import { CanvasServiceDetails_service$key } from './__generated__/CanvasServiceDetails_service.graphql';

type Props = {
  serviceRef: CanvasServiceDetails_service$key;
  secretsRef: CanvasServiceDetails_secrets$key;
  isDisabled?: boolean;
};

export default function CanvasServiceDetails({
  serviceRef,
  secretsRef,
  isDisabled,
}: Props) {
  const service = useFragment(
    graphql`
      fragment CanvasServiceDetails_service on Service {
        itemId
        namespaceStatus
        ...CanvasItem_namespaceItem
        ...ServiceForm_serviceBase
      }
    `,
    serviceRef,
  );

  const secrets = useFragment(
    graphql`
      fragment CanvasServiceDetails_secrets on DockerRegistrySecret
      @relay(plural: true) {
        ...ServiceForm_dockerRegistrySecrets
      }
    `,
    secretsRef,
  );

  const pointerEvents = usePointerEvents();
  const [updateItem] = useUpdateNamespaceItem();
  const debouncedUpdate = useDebounce(updateItem, 300);

  const onUpdate = async (updatedService: ServiceInput) => {
    await debouncedUpdate({
      itemType: 'Service',
      service: {
        itemId: service.itemId,
        ...updatedService,
      },
    });
  };

  return (
    <CanvasItem namespaceItemRef={service} icon={faMicrochip}>
      <ServiceForm
        key={service.itemId}
        serviceRef={service}
        secretsRef={secrets}
        pointerEvents={pointerEvents}
        isDisabled={isDisabled || !!service.namespaceStatus}
        onUpdate={onUpdate}
        envInputWidth={172}
      />
    </CanvasItem>
  );
}
