'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { initialAssets } from '@/lib/data';
import type { AssetCategory } from '@/lib/definitions';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';

const chartData = initialAssets.reduce((acc, asset) => {
  const category = asset.category;
  const existing = acc.find((item) => item.category === category);
  if (existing) {
    existing.count += 1;
  } else {
    acc.push({ category, count: 1 });
  }
  return acc;
}, [] as { category: AssetCategory; count: number }[]);

const chartConfig = {
  count: {
    label: 'Jumlah Aset',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

export default function AssetValueDistributionChart() {
  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
            data={chartData}
            margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
            >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="category"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(value) => value.slice(0, 10)}
          />
          <YAxis allowDecimals={false} />
           <Tooltip
            cursor={false}
            content={<ChartTooltipContent indicator="dot" />}
          />
          <Bar dataKey="count" fill="var(--color-count)" radius={4} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
