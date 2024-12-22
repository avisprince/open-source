import { createUseStyles } from 'react-jss';
import { graphql, useFragment } from 'react-relay';

import Flexbox from 'src/components/custom/Flexbox';
import { OrganizationResources_organization$key } from 'src/components/dashboard/content/organization/__generated__/OrganizationResources_organization.graphql';
import { DokkimiColorsV2 } from 'src/components/styles/colors';

type Props = {
  organizationRef: OrganizationResources_organization$key | null;
};

export default function OrganizationResources({ organizationRef }: Props) {
  const styles = useStyles();
  const organization = useFragment(
    graphql`
      fragment OrganizationResources_organization on Organization {
        allocatedResources {
          cpu
          memory
        }
      }
    `,
    organizationRef,
  );

  return (
    <Flexbox alignItems="center" justifyContent="space-between">
      <Flexbox grow={1} className={styles.title}>
        Reserved Resources
      </Flexbox>
      <Flexbox alignItems="center" justifyContent="center" gap={40} grow={1}>
        <Flexbox direction="column" alignItems="center" gap={16}>
          <div className={styles.cpuTitle}>CPU</div>
          <div className={styles.cpuUsage}>
            {organization?.allocatedResources.cpu}m
          </div>
        </Flexbox>
        <Flexbox direction="column" alignItems="center" gap={16}>
          <div className={styles.ramTitle}>RAM</div>
          <div className={styles.ramUsage}>
            {organization?.allocatedResources.memory}Mi
          </div>
        </Flexbox>
      </Flexbox>
    </Flexbox>
  );
}

const useStyles = createUseStyles({
  title: {
    fontSize: 28,
  },
  cpuTitle: {
    fontSize: 24,
    color: DokkimiColorsV2.cpuBlue,
  },
  cpuUsage: {
    fontSize: 22,
  },
  ramTitle: {
    fontSize: 24,
    color: DokkimiColorsV2.ramOrange,
  },
  ramUsage: {
    fontSize: 22,
  },
});
