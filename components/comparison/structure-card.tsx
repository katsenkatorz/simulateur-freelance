"use client";

import { cn } from "@/lib/utils";
import { fmt } from "@/lib/engine";
import { useAnimatedNumber } from "@/hooks/use-animated-number";
import type { StructConfig } from "@/lib/types";
import type { ElementType } from "react";

interface StructureCardProps {
  struct: StructConfig;
  icon?: ElementType;
  net: number;
  ret: number;
  ca: number;
  isB: boolean;
  selected: boolean;
  onClick: () => void;
}

export function StructureCard({ struct, icon: Icon, net, ret, ca, isB, selected, onClick }: StructureCardProps) {
  const total = net + ret;
  const pct = ca > 0 ? Math.round(total / ca * 100) : 0;
  const animNet = useAnimatedNumber(net);
  const animMonthly = useAnimatedNumber(Math.round(net / 12));

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-xl border p-4 transition-all duration-200 cursor-pointer",
        selected
          ? "border-text-primary/20 bg-bg-elevated"
          : "border-border-subtle bg-bg-card hover:border-border-default"
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        {Icon && <Icon size={16} className={cn("shrink-0", selected ? "text-text-primary" : "text-text-tertiary")} />}
        <span className={cn("text-sm font-semibold truncate", selected ? "text-text-primary" : "text-text-secondary")}>
          {struct.name}
        </span>
        {isB && (
          <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded bg-text-primary/5 text-text-secondary shrink-0">
            B
          </span>
        )}
      </div>

      <div className="font-mono text-2xl font-bold text-text-primary mb-0.5">
        {fmt(animNet)}
      </div>
      <div className="text-[11px] text-text-tertiary mb-1">
        {ret > 0 ? "net perso/an" : "net après IR/an"}
      </div>

      <div className="flex items-baseline gap-1 mb-3">
        <span className={cn("font-mono text-sm font-semibold", selected ? "text-text-primary" : "text-text-secondary")}>
          {fmt(animMonthly)}
        </span>
        <span className="text-[11px] text-text-tertiary">/mois</span>
      </div>

      {ret > 0 && (
        <div className="text-[11px] text-positive mb-3 flex items-center gap-1">
          <span className="inline-block w-1 h-1 rounded-full bg-positive" />
          + {fmt(ret)} capitalisé
        </div>
      )}

      <div className="w-full h-1 bg-bg-primary rounded-full overflow-hidden mb-1">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: pct + "%", background: selected ? "#fafafa" : "#52525b" }}
        />
      </div>
      <div className="text-[10px] text-text-tertiary">{pct}%</div>
    </button>
  );
}
