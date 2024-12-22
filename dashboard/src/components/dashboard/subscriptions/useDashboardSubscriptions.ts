import useNamespaceHealthSubscription from 'src/subscriptions/useNamespaceHealthSubscription';
import useOrganizationUsageSubscription from 'src/subscriptions/useOrganizationUsageSubscription';

export default function useDashboardSubscriptions() {
  useOrganizationUsageSubscription();
  useNamespaceHealthSubscription();
}
