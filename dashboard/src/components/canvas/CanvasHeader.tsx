import { Divider } from '@fluentui/react-components';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import CanvasActiveUsers from 'src/components/canvas/header/CanvasActiveUsers';
import ItemStatusMenu from 'src/components/canvas/header/ItemStatusMenu';
import NamespaceUsage from 'src/components/canvas/header/NamespaceUsage';
import SelectNamespaceMenu from 'src/components/canvas/header/SelectNamespaceMenu';
import StartNamespaceButton from 'src/components/canvas/header/StartNamespaceButton';
import AvatarMenu from 'src/components/custom/AvatarMenu';
import Flexbox from 'src/components/custom/Flexbox';
import { DokkimiColors } from 'src/components/styles/colors';
import { Stylesheet } from 'src/types/Stylesheet';

import { CanvasHeader_query$key } from './__generated__/CanvasHeader_query.graphql';

type Props = {
  queryRef: CanvasHeader_query$key;
};

export default function CanvasHeader({ queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment CanvasHeader_query on Query
      @argumentDefinitions(
        organizationId: { type: "ID!" }
        namespaceId: { type: "ID!" }
      ) {
        namespace(namespaceId: $namespaceId) {
          status
          activeUsers {
            ...CanvasActiveUsers_activeUsers
          }
          ...NamespaceUsage_namespace
          ...ItemStatusMenuItem_namespace
        }
        ...StartNamespaceButton_query
          @arguments(organizationId: $organizationId, namespaceId: $namespaceId)
        ...SelectNamespaceMenu_query
          @arguments(organizationId: $organizationId, namespaceId: $namespaceId)
        currentUser {
          ...AvatarMenu_user
        }
      }
    `,
    queryRef,
  );

  return (
    <>
      <Flexbox alignItems="center" gap={8}>
        {query.namespace.status !== 'inactive' && (
          <Flexbox alignItems="center" gap={8}>
            <NamespaceUsage namespaceRef={query.namespace} />
            <ItemStatusMenu namespaceRef={query.namespace} />
          </Flexbox>
        )}
        <StartNamespaceButton queryRef={query} />
        <Flexbox alignItems="center" style={styles.container} gap={16}>
          <SelectNamespaceMenu queryRef={query} />
          <Divider vertical />
          <AvatarMenu userRef={query.currentUser} />
        </Flexbox>
      </Flexbox>
      <CanvasActiveUsers activeUserRefs={query.namespace.activeUsers} />
    </>
  );
}

const styles = {
  container: {
    height: 52,
    borderRadius: 4,
    backgroundColor: DokkimiColors.blackBackgroundColor,
    paddingRight: 16,
  },
} satisfies Stylesheet;
