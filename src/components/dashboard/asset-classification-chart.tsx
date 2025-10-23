'use client';

import { Pie, PieChart, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { getEnrichedAssets } from '@/lib/data';
import type { AssetClassificationValue } from '@/lib/definitions';
import { useTheme } from 'next-themes';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';

const assets = getEnrichedAssets();
const chartData = assets.reduce((acc, asset) => {
  const classification = asset.asset_value;
  if (!classification) return acc;
  const existing = acc.find((item) => item.classification === classification);
  if (existing) {
    existing.count += 1;
  } else {
    acc.push({ classification, count: 1 });
  }
  return acc;
}, [] as { classification: AssetClassificationValue; count: number }[]);

const chartConfig = {
  count: {
    label: 'Aset',
  },
  Tinggi: {
    label: 'Tinggi',
    color: 'hsl(var(--chart-1))',
  },
  Sedang: {
    label: 'Sedang',
    color: 'hsl(var(--chart-2))',
  },
  Rendah: {
    label: 'Rendah',
    color: 'hsl(var(--chart-3))',
  },
  'Belum Dinilai': {
    label: 'Belum Dinilai',
    color: 'hsl(var(--muted))',
  },
} satisfies ChartConfig;

export default function AssetClassificationChart() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square h-[250px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
          <Pie
            data={chartData}
            dataKey="count"
            nameKey="classification"
            innerRadius={60}
            strokeWidth={5}
          >
            {chartData.map((entry) => (
              <Cell
                key={entry.classification}
                fill={chartConfig[entry.classification]?.color || '#8884d8'}
                className="focus:outline-none"
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
