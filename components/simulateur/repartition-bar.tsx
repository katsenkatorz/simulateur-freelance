"use client";

import { Bar, BarChart, Cell, XAxis, YAxis, CartesianGrid } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { fmt } from "@/lib/engine";

export interface Segment {
  key: string;
  label: string;
  amount: number;
  percent: number;
  color: string;
  monthly?: number;
}

interface RepartitionBarProps {
  segments: Segment[];
  ca: number;
}

export function RepartitionBar({ segments, ca }: RepartitionBarProps) {
  const chartConfig: ChartConfig = {};
  segments.forEach(seg => {
    chartConfig[seg.key] = { label: seg.label, color: seg.color };
  });

  // Each segment is a row in a horizontal bar chart
  const data = segments.map(seg => ({
    name: seg.label,
    value: seg.percent,
    amount: seg.amount,
    monthly: seg.monthly,
    fill: seg.color,
    key: seg.key,
  }));

  return (
    <div className="space-y-3">
      <ChartContainer config={chartConfig} className="!aspect-auto h-[140px] w-full">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 8, bottom: 0, left: 0 }}
          barCategoryGap={4}
        >
          <YAxis
            type="category"
            dataKey="name"
            width={90}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "#a1a1aa" }}
          />
          <XAxis type="number" hide domain={[0, 100]} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} animationDuration={800} animationEasing="ease-out">
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
          </Bar>
          <ChartTooltip
            cursor={{ fill: "rgba(255,255,255,0.03)" }}
            content={
              <ChartTooltipContent
                hideLabel
                hideIndicator
                formatter={(value, name, item) => {
                  const d = item?.payload;
                  return (
                    <div className="min-w-[160px]">
                      <div className="font-medium mb-1">{d?.name}</div>
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Montant</span>
                        <span className="font-mono font-bold">{fmt(d?.amount || 0)}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Part du CA</span>
                        <span className="font-mono">{d?.value}%</span>
                      </div>
                      {d?.monthly > 0 && (
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Mensuel</span>
                          <span className="font-mono">{fmt(d.monthly)}/mois</span>
                        </div>
                      )}
                    </div>
                  );
                }}
              />
            }
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
}
