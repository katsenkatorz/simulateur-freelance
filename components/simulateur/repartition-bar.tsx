"use client";

import { Bar, BarChart, XAxis, Cell, ResponsiveContainer, Tooltip } from "recharts";
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

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: Segment }> }) {
  if (!active || !payload?.length) return null;
  const seg = payload[0].payload;
  return (
    <div className="bg-[#18181b] border border-[#3f3f46] px-4 py-3 rounded-lg shadow-xl">
      <div className="text-xs font-medium text-[#a1a1aa] mb-1">{seg.label}</div>
      <div className="text-base font-bold font-mono text-[#fafafa]">{fmt(seg.amount)}</div>
      <div className="flex gap-3 mt-1 text-[11px] text-[#71717a]">
        <span>{seg.percent}% du CA</span>
        {seg.monthly && <span>{fmt(seg.monthly)}/mois</span>}
      </div>
    </div>
  );
}

export function RepartitionBar({ segments }: RepartitionBarProps) {
  // Transform segments into stacked bar data
  const barData = [segments.reduce((acc, seg) => {
    acc[seg.label] = seg.percent;
    return acc;
  }, {} as Record<string, number>)];

  return (
    <div className="space-y-3">
      {/* Stacked horizontal bar */}
      <div className="h-12 w-full">
        <ResponsiveContainer width="100%" height="100%">
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
                fill={seg.color}
                radius={i === 0 ? [6, 0, 0, 6] : i === segments.length - 1 ? [0, 6, 6, 0] : 0}
                isAnimationActive={true}
                animationDuration={800}
                animationEasing="ease-out"
              />
            ))}
            <Tooltip
              content={<CustomSegmentTooltip segments={segments} />}
              cursor={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend with amounts */}
      <div className="flex flex-wrap gap-x-5 gap-y-2">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-2 text-[11px]">
            <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: seg.color }} />
            <span className="text-[#a1a1aa]">{seg.label}</span>
            <span className="font-mono text-[#d4d4d8]">{fmt(seg.amount)}</span>
            <span className="font-mono text-[#71717a]">{seg.percent}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Custom tooltip that finds the right segment based on mouse position
function CustomSegmentTooltip({ active, payload, segments }: { active?: boolean; payload?: unknown[]; segments: Segment[] }) {
  if (!active || !payload) return null;

  // Show all segments as a summary tooltip
  return (
    <div className="bg-[#18181b] border border-[#3f3f46] px-4 py-3 rounded-lg shadow-xl">
      {segments.map((seg, i) => (
        <div key={i} className={cn("flex items-center gap-3 py-1", i > 0 && "border-t border-[#27272a]")}>
          <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: seg.color }} />
          <span className="text-xs text-[#a1a1aa] flex-1">{seg.label}</span>
          <span className="text-xs font-mono text-[#fafafa] font-medium">{fmt(seg.amount)}</span>
          <span className="text-[10px] font-mono text-[#71717a] w-8 text-right">{seg.percent}%</span>
        </div>
      ))}
      <div className="flex items-center gap-3 pt-1.5 mt-1 border-t border-[#3f3f46]">
        <span className="text-xs text-[#a1a1aa] flex-1">Total</span>
        <span className="text-xs font-mono text-[#fafafa] font-bold">{fmt(segments.reduce((s, seg) => s + seg.amount, 0))}</span>
        <span className="text-[10px] font-mono text-[#71717a] w-8 text-right">100%</span>
      </div>
    </div>
  );
}
