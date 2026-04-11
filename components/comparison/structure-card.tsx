"use client";

import { cn } from "@/lib/utils";
import { fmt } from "@/lib/engine";
import type { StructConfig } from "@/lib/types";

interface StructureCardProps {
  struct: StructConfig;
  net: number;
  ret: number;
  ca: number;
  isB: boolean;
  selected: boolean;
  onClick: () => void;
}

export function StructureCard({ struct, net, ret, ca, isB, selected, onClick }: StructureCardProps) {
  const total = net + ret;
  const pct = ca > 0 ? Math.round(total / ca * 100) : 0;

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-xl border p-4 transition-all duration-200 cursor-pointer group",
        selected
          ? "border-accent bg-accent/5"
          : "border-border-subtle bg-bg-card hover:border-border-default hover:bg-bg-elevated"
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{struct.icon}</span>
        <span className="text-sm font-semibold" style={{ color: struct.accent }}>{struct.name}</span>
        {isB && (
          <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded bg-tax/10 text-tax">
            MODE B
          </span>
        )}
      </div>

      <div className="font-mono text-2xl font-bold text-text-primary mb-0.5">
        {fmt(net)}
      </div>
      <div className="text-[11px] text-text-tertiary mb-1">
        {ret > 0 ? "net perso/an" : "net après IR/an"}
      </div>

      <div className="flex items-baseline gap-1 mb-3">
        <span className="font-mono text-sm font-semibold" style={{ color: struct.accent }}>
          {fmt(Math.round(net / 12))}
        </span>
        <span className="text-[11px] text-text-tertiary">/mois</span>
      </div>

      {ret > 0 && (
        <div className="text-[11px] text-positive mb-3 flex items-center gap-1">
          <span className="inline-block w-1 h-1 rounded-full bg-positive" />
          + {fmt(ret)} capitalisé
        </div>
      )}

      {/* Bar */}
      <div className="w-full h-1.5 bg-bg-primary rounded-full overflow-hidden mb-1">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: pct + "%", background: struct.accent }}
        />
      </div>
      <div className="text-[10px] text-text-tertiary">{pct}% conservé</div>
    </button>
  );
}
