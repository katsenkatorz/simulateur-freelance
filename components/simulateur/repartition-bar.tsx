"use client";

import { Bar, BarChart, XAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import { fmt } from "@/lib/engine";

export interface Segment {
  label: string;
  amount: number;
  percent: number;
  colorClass: string;
  bgClass: string;
  color: string;
  monthly?: number;
}

interface RepartitionBarProps {
  segments: Segment[];
  ca: number;
}

export function RepartitionBar({ segments, ca }: RepartitionBarProps) {
  // Build chart config from segments
  const chartConfig: ChartConfig = {};
  segments.forEach(seg => {
    chartConfig[seg.label] = {
      label: seg.label,
      color: seg.color,
    };
  });

  // Build data row
  const barData = [
    segments.reduce((acc, seg) => {
      acc[seg.label] = seg.percent;
      return acc;
    }, { name: "répartition" } as Record<string, string | number>),
  ];

  return (
    <div className="space-y-3">
      <ChartContainer config={chartConfig} className="h-12 w-full aspect-auto">
        <BarChart
          data={barData}
          layout="vertical"
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
          barSize={48}
        >
          <XAxis type="number" hide domain={[0, 100]} />
          {segments.map((seg, i) => (
            <Bar
              key={seg.label}
              dataKey={seg.label}
              stackId="repartition"
              fill={`var(--color-${seg.label})`}
              radius={i === 0 ? [6, 0, 0, 6] : i === segments.length - 1 ? [0, 6, 6, 0] : 0}
              isAnimationActive={true}
              animationDuration={800}
              animationEasing="ease-out"
            />
          ))}
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                hideLabel
                formatter={(value, name) => {
                  const seg = segments.find(s => s.label === name);
                  if (!seg) return null;
                  return (
                    <div className="flex items-center justify-between gap-4 w-full">
                      <span className="text-muted-foreground">{seg.label}</span>
                      <span className="font-mono font-bold">{fmt(seg.amount)}</span>
                      <span className="text-muted-foreground text-[10px]">{seg.percent}%</span>
                    </div>
                  );
                }}
              />
            }
          />
        </BarChart>
      </ChartContainer>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-5 gap-y-2">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-2 text-[11px]">
            <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: seg.color }} />
            <span className="text-muted-foreground">{seg.label}</span>
            <span className="font-mono text-foreground">{fmt(seg.amount)}</span>
            <span className="font-mono text-muted-foreground">{seg.percent}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
