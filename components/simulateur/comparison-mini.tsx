"use client";

import { cn } from "@/lib/utils";
import { fmt } from "@/lib/engine";
import type { StructConfig } from "@/lib/types";
import type { ElementType } from "react";

interface ComparisonRow {
  struct: StructConfig;
  icon?: ElementType;
  net: number;
  ret: number;
  ca: number;
}

interface ComparisonMiniProps {
  rows: ComparisonRow[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function ComparisonMini({ rows, selectedId, onSelect }: ComparisonMiniProps) {
  return (
    <div className="space-y-1">
      {/* Header */}
      <div className="grid grid-cols-[1fr_auto_auto_80px] gap-3 px-3 py-1.5 text-[10px] text-text-tertiary uppercase tracking-wider">
        <span>Statut</span>
        <span className="text-right w-20">Net/an</span>
        <span className="text-right w-16">Net/mois</span>
        <span className="text-right">% du CA</span>
      </div>

      {/* Rows */}
      {rows.map(row => {
        const isSelected = row.struct.id === selectedId;
        const total = row.net + row.ret;
        const pct = row.ca > 0 ? Math.round(total / row.ca * 100) : 0;
        const Icon = row.icon;

        return (
          <button
            key={row.struct.id}
            onClick={() => onSelect(row.struct.id)}
            className={cn(
              "w-full grid grid-cols-[1fr_auto_auto_80px] gap-3 px-3 py-2.5 rounded-md text-sm transition-colors cursor-pointer items-center",
              isSelected
                ? "bg-bg-elevated text-text-primary"
                : "text-text-secondary hover:bg-bg-elevated/50"
            )}
          >
            <span className="flex items-center gap-2 text-left">
              {Icon && <Icon size={14} className="shrink-0" style={{ color: row.struct.accent }} aria-hidden="true" />}
              <span className={cn("font-medium truncate", isSelected && "text-text-primary")}>{row.struct.name}</span>
            </span>
            <span className="font-mono text-right w-20">{fmt(row.net)}</span>
            <span className="font-mono text-right w-16 text-text-tertiary">{fmt(Math.round(row.net / 12))}</span>
            {/* Barre proportionnelle au CA (0-100%) */}
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-bg-primary rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: pct + "%", background: row.struct.accent }}
                />
              </div>
              <span className="font-mono text-[10px] text-text-tertiary w-7 text-right">{pct}%</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
