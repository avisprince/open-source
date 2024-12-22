import { ReactNode } from 'react';
import { createUseStyles } from 'react-jss';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Text,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export type ChartDataPoint = {
  cpu: number;
  memory: number;
  timestamp: string;
};

type Props = {
  data: ChartDataPoint[];
  dataKey: string;
  stroke: string;
  tickFormatter: (value: number, index: number) => string;
  title?: ReactNode;
  legendFormatter?: () => string;
};

export default function OrganizationUsageLineChart({
  data,
  dataKey,
  stroke,
  tickFormatter,
  title,
  legendFormatter,
}: Props) {
  const styles = useStyles();

  return (
    <>
      {title && <div className={styles.title}>{title}</div>}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <XAxis
            dataKey="timestamp"
            height={52}
            tickMargin={8}
            tick={({ x, y, payload }) => (
              <Text x={x} y={y} textAnchor="end" angle={-45} fontSize={14}>
                {payload.value}
              </Text>
            )}
          />
          <YAxis tickFormatter={tickFormatter} />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip
            contentStyle={{ backgroundColor: '#333' }}
            labelFormatter={val => `Time: ${val}`}
            formatter={tickFormatter}
          />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={stroke}
            isAnimationActive={false}
            dot={false}
          />
          <Legend formatter={legendFormatter} />
        </LineChart>
      </ResponsiveContainer>
    </>
  );
}

const useStyles = createUseStyles({
  title: {
    fontSize: 20,
  },
});
