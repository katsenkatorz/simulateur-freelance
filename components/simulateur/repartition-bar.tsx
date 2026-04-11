"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { fmt } from "@/lib/engine";

export interface Segment {
  label: string;
  amount: number;
  percent: number;
  colorClass: string;
  bgClass: string;
  monthly?: number;
}

interface RepartitionBarProps {
  segments: Segment[];
  ca: number;
}

export function RepartitionBar({ segments }: RepartitionBarProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {/* Bar */}
      <div className="relative">
        <div className="flex h-10 rounded-lg overflow-hidden gap-[2px] bg-bg-elevated">
          {segments.map((seg, i) => (
            <div
              key={i}
              className={cn(
                "relative flex flex-col items-center justify-center cursor-default transition-all duration-700 ease-out",
                "hover:brightness-125",
                seg.bgClass,
                i === 0 && "rounded-l-lg",
                i === segments.length - 1 && "rounded-r-lg"
              )}
              style={{ width: seg.percent + "%" }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              {seg.percent > 18 && (
                <>
                  <span className="text-[11px] font-bold font-mono leading-none text-bg-primary/90">
                    {fmt(seg.amount)}
                  </span>
                  <span className="text-[9px] font-medium leading-none text-bg-primary/60 mt-0.5">
                    {seg.percent}%
                  </span>
                </>
              )}
              {seg.percent > 8 && seg.percent <= 18 && (
                <span className="text-[9px] font-bold font-mono text-bg-primary/80">
                  {seg.percent}%
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Tooltip */}
        {hovered !== null && (() => {
          const seg = segments[hovered];
          // Position tooltip roughly above the segment
          const leftPct = segments.slice(0, hovered).reduce((s, seg) => s + seg.percent, 0) + seg.percent / 2;
          return (
            <div
              className="absolute bottom-full mb-2 -translate-x-1/2 pointer-events-none z-50"
              style={{ left: leftPct + "%" }}
            >
              <div className="bg-bg-card border border-border-default px-4 py-3 rounded-lg shadow-xl whitespace-nowrap">
                <div className="text-xs font-medium text-text-secondary mb-1">{seg.label}</div>
                <div className="text-base font-bold font-mono text-text-primary">{fmt(seg.amount)}</div>
                <div className="flex gap-3 mt-1 text-[11px] text-text-tertiary">
                  <span>{seg.percent}% du CA</span>
                  {seg.monthly && <span>{fmt(seg.monthly)}/mois</span>}
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-5 gap-y-1.5">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-2 text-[11px]">
            <span className={cn("w-2.5 h-2.5 rounded-sm shrink-0", seg.bgClass)} />
            <span className="text-text-tertiary">{seg.label}</span>
            <span className="font-mono text-text-secondary">{fmt(seg.amount)}</span>
            <span className="font-mono text-text-tertiary">{seg.percent}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
