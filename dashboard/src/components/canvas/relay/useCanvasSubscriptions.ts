import { useRecoilValue } from 'recoil';

import useNamespaceActionsSubscription from 'src/components/canvas/relay/subscriptions/useNamespaceActionsSubscription';
import useNamespaceActiveUsersSubscription from 'src/components/canvas/relay/subscriptions/useNamespaceActiveUsersSubscription';
import useNamespaceDeleteItemsSubscription from 'src/components/canvas/relay/subscriptions/useNamespaceDeleteItemsSubscription';
import useNamespaceNewItemSubscription from 'src/components/canvas/relay/subscriptions/useNamespaceNewItemSubscription';
import useNamespaceQueriesSubscription from 'src/components/canvas/relay/subscriptions/useNamespaceQueriesSubscription';
import useNamespaceUpdateItemSubscription from 'src/components/canvas/relay/subscriptions/useNamespaceUpdateItemSubscription';
import { sessionAtom } from 'src/recoil/dashboard/dashboard.atoms';
import useNamespaceHealthSubscription from 'src/subscriptions/useNamespaceHealthSubscription';
import useOrganizationUsageSubscription from 'src/subscriptions/useOrganizationUsageSubscription';

export const useCanvasSubscriptions = () => {
  const { namespaceId } = useRecoilValue(sessionAtom);

  useOrganizationUsageSubscription();
  useNamespaceHealthSubscription();
  useNamespaceActionsSubscription(namespaceId);
  useNamespaceQueriesSubscription(namespaceId);
  useNamespaceNewItemSubscription(namespaceId);
  useNamespaceUpdateItemSubscription(namespaceId);
  useNamespaceDeleteItemsSubscription(namespaceId);
  // useNamespaceActiveUsersSubscription(namespaceId, orgId);
};
