import { Dictionary } from 'lodash';
import { useMemo } from 'react';
import { useSubscription } from 'react-relay';
import { useRecoilValue } from 'recoil';
import { RecordProxy, graphql } from 'relay-runtime';

import { sessionAtom } from 'src/recoil/dashboard/dashboard.atoms';

export default function useNamespaceHealthSubscription() {
  const { orgId } = useRecoilValue(sessionAtom);

  useSubscription(
    useMemo(
      () => ({
        subscription: graphql`
          subscription useNamespaceHealthSubscription($orgId: ID!) {
            namespaceHealth(orgId: $orgId) {
              namespaceId
              namespaceHealth {
                status
                usage {
                  cpu
                  memory
                }
                serviceStatus {
                  name
                  status
                  usage {
                    cpu
                    memory
                  }
                }
              }
            }
          }
        `,
        variables: {
          orgId,
        },
        updater: store => {
          const health = store.getRootField('namespaceHealth');
          const namespaceId = health?.getValue('namespaceId') as string;
          const namespaceHealth = health?.getLinkedRecord('namespaceHealth');

          const serviceStatus =
            namespaceHealth?.getLinkedRecords('serviceStatus');

          const statuses: Dictionary<{
            status: string;
            usage: RecordProxy | null;
          }> =
            serviceStatus?.reduce((agg, record) => {
              const itemId = record.getValue('name');
              const status = record.getValue('status');
              const usage = record.getLinkedRecord('usage');

              if (!itemId || !status) {
                return agg;
              }

              return {
                ...agg,
                [itemId as string]: { status, usage },
              };
            }, {}) ?? {};

          const namespace = store.get(namespaceId);
          const namespaceStatus = namespaceHealth?.getValue('status');
          const namespaceUsage = namespaceHealth?.getLinkedRecord('usage');
          if (namespaceStatus === null) {
            namespace?.setValue('inactive', 'status');
          }
          namespace?.setLinkedRecord(namespaceUsage ?? null, 'usage');

          const items = namespace?.getLinkedRecords('items') || [];
          const services = namespace?.getLinkedRecords('services') || [];
          const databases = namespace?.getLinkedRecords('databases') || [];

          [...items, ...services, ...databases].forEach(item => {
            const itemId = item.getValue('itemId') as string;
            const itemStatus = statuses[itemId];

            if (namespaceStatus === null) {
              item.setValue(null, 'namespaceStatus');
              item.setValue(null, 'usage');
            } else if (!!itemStatus) {
              item.setValue(itemStatus.status, 'namespaceStatus');
              item.setLinkedRecord(itemStatus.usage, 'usage');
            }
          });
        },
      }),
      [orgId],
    ),
  );
}
