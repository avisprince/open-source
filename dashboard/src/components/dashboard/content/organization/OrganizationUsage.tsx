import dayjs, { Dayjs } from 'dayjs';
import { Dictionary } from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { graphql, useFragment } from 'react-relay';

import Flexbox from 'src/components/custom/Flexbox';
import OrganizationUsageLineChart, {
  ChartDataPoint,
} from 'src/components/dashboard/content/organization/OrganizationUsageLineChart';
import { DokkimiColorsV2 } from 'src/components/styles/colors';

import { OrganizationUsage_organization$key } from './__generated__/OrganizationUsage_organization.graphql';

function roundDownToNearestFiveSeconds(timestamp: Dayjs | string): string {
  const date = dayjs(timestamp);
  const seconds = date.second();
  // Round down to nearest 0 or 5 seconds
  const roundedSeconds = (Math.floor((seconds / 10) * 2) * 10) / 2;
  return date.second(roundedSeconds).format('h:mm:ss');
}

function getLastTenMinutesEmptyMetrics() {
  const timestamps: Dictionary<ChartDataPoint> = {};
  const now = dayjs();
  const tenMinutesAgo = now.subtract(10, 'minute');

  for (
    let time = tenMinutesAgo;
    time.isBefore(now);
    time = time.add(5, 'second')
  ) {
    const timestamp = roundDownToNearestFiveSeconds(time);
    timestamps[timestamp] = {
      cpu: 0,
      memory: 0,
      timestamp,
    };
  }

  return timestamps;
}

type Props = {
  organizationRef: OrganizationUsage_organization$key | null;
};

export default function OrganizationUsage({ organizationRef }: Props) {
  const styles = useStyles();
  const organization = useFragment(
    graphql`
      fragment OrganizationUsage_organization on Organization {
        usage {
          cpu
          memory
          timestamp
        }
      }
    `,
    organizationRef,
  );

  const calculateChartUsage = useCallback(() => {
    const timestamps = getLastTenMinutesEmptyMetrics();

    organization?.usage?.forEach(({ cpu, memory, timestamp }) => {
      const ts = roundDownToNearestFiveSeconds(timestamp);
      timestamps[ts] = {
        cpu: Number(cpu.toFixed(2)),
        memory: Number(memory.toFixed(2)),
        timestamp: ts,
      };
    });

    return Object.values(timestamps).sort((a, b) =>
      a.timestamp < b.timestamp ? -1 : 1,
    );
  }, [organization?.usage]);

  const [chartData, setChartData] = useState(calculateChartUsage());

  useEffect(() => {
    const updateChartData = () => {
      const data = calculateChartUsage();
      setChartData(data);
    };

    const intervalId = setInterval(updateChartData, 5000);

    return () => {
      updateChartData();
      clearInterval(intervalId);
    };
  }, [calculateChartUsage]);

  const latestChartData = chartData[chartData.length - 1];

  return (
    <Flexbox direction="column" gap={32}>
      <Flexbox direction="column" gap={12}>
        <div className={styles.title}>Resource Usage</div>
        <div className={styles.subtitle}>(Last 10 Minutes)</div>
      </Flexbox>
      <Flexbox alignItems="center" gap={20}>
        <Flexbox
          direction="column"
          gap={20}
          alignItems="center"
          style={{ width: '50%' }}
        >
          <OrganizationUsageLineChart
            data={chartData}
            dataKey="cpu"
            stroke={DokkimiColorsV2.cpuBlue}
            tickFormatter={val => `${val}m`}
            title={`CPU: ${latestChartData.cpu} millicores`}
            legendFormatter={() => 'CPU (millicores)'}
          />
        </Flexbox>
        <Flexbox
          direction="column"
          gap={20}
          alignItems="center"
          style={{ width: '50%' }}
        >
          <OrganizationUsageLineChart
            data={chartData}
            dataKey="memory"
            stroke={DokkimiColorsV2.ramOrange}
            tickFormatter={val => `${val}Mi`}
            title={`RAM: ${latestChartData.memory} Mibibytes`}
            legendFormatter={() => 'RAM (Mibibytes)'}
          />
        </Flexbox>
      </Flexbox>
    </Flexbox>
  );
}

const useStyles = createUseStyles({
  chartHeader: {
    fontSize: 16,
  },
  title: {
    fontSize: 28,
  },
  subtitle: {
    fontSize: 16,
  },
});
