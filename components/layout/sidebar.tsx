"use client";

import { cn } from "@/lib/utils";
import { CurrencyInput } from "@/components/ui/currency-input";
import { MICRO_CAP } from "@/lib/fiscal";
import { fmt } from "@/lib/engine";
import { Users, Target, Scale } from "lucide-react";

interface SidebarProps {
  ca: number;
  setCa: (v: number) => void;
  parts: number;
  setParts: (v: number) => void;
  gm: string;
  setGm: (v: string) => void;
  isSeuilEtendu: boolean;
  setIsSeuilEtendu: (v: boolean) => void;
  isCapped: boolean;
}

function SectionLabel({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-[11px] font-medium text-text-tertiary uppercase tracking-wider mb-2">
      <Icon size={12} />
      {children}
    </div>
  );
}

export function Sidebar({ ca, setCa, parts, setParts, gm, setGm, isSeuilEtendu, setIsSeuilEtendu, isCapped }: SidebarProps) {
  return (
    <aside className="w-[280px] shrink-0 sticky top-0 h-screen overflow-y-auto border-r border-border-subtle bg-bg-card p-6 flex flex-col gap-8 max-lg:hidden">
      <div>
        <h1 className="text-lg font-bold text-text-primary tracking-tight">Simulateur</h1>
        <p className="text-[11px] text-text-tertiary mt-0.5">Freelance · Barème 2026</p>
      </div>

      <div>
        <CurrencyInput label="CA annuel HT" value={ca} onChange={setCa} min={10_000} max={1_000_000} />
        {isCapped && (
          <p className="text-[11px] text-tax mt-2 flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-tax" />
            Micro plafonné à {fmt(MICRO_CAP)}
          </p>
        )}
      </div>

      <div>
        <SectionLabel icon={Users}>Parts fiscales</SectionLabel>
        <div className="flex gap-1">
          {[1, 1.5, 2, 2.5, 3].map(p => (
            <button
              key={p}
              onClick={() => setParts(p)}
              className={cn(
                "flex-1 py-2 rounded-md text-sm font-semibold transition-all duration-200 border",
                parts === p
                  ? "bg-text-primary text-bg-primary border-text-primary"
                  : "bg-transparent text-text-tertiary border-border-subtle hover:border-border-default hover:text-text-secondary"
              )}
            >
              {p}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-text-tertiary mt-1.5">1 = célib · 2 = couple · +0.5/enfant</p>
      </div>

      <div>
        <SectionLabel icon={Target}>Stratégie</SectionLabel>
        <div className="flex flex-col gap-1.5">
          {[
            { v: "A", l: "Tout en salaire", sub: "100% en rémunération" },
            { v: "B", l: "Capitaliser", sub: "Salaire + capital en société (IS)" },
          ].map(o => (
            <button
              key={o.v}
              onClick={() => setGm(o.v)}
              className={cn(
                "w-full py-2.5 px-3 rounded-lg text-sm text-left transition-all duration-200 border",
                gm === o.v
                  ? "bg-text-primary/5 text-text-primary border-text-primary/20"
                  : "bg-transparent text-text-tertiary border-border-subtle hover:border-border-default"
              )}
            >
              <div className="font-semibold">{o.l}</div>
              <div className="text-[10px] text-text-tertiary mt-0.5">{o.sub}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <SectionLabel icon={Scale}>Seuil IS 15%</SectionLabel>
        <div className="flex gap-1.5">
          {[
            { v: false, l: "≤ 42 500 €" },
            { v: true, l: "≤ 100 000 €" },
          ].map(o => (
            <button
              key={String(o.v)}
              onClick={() => setIsSeuilEtendu(o.v)}
              className={cn(
                "flex-1 py-2 rounded-md text-xs font-semibold transition-all duration-200 border",
                isSeuilEtendu === o.v
                  ? "bg-text-primary/5 text-text-primary border-text-primary/20"
                  : "bg-transparent text-text-tertiary border-border-subtle hover:border-border-default"
              )}
            >
              {o.l}
            </button>
          ))}
        </div>
        {isSeuilEtendu && (
          <p className="text-[10px] text-text-tertiary mt-1.5">
            <a href="https://www.assemblee-nationale.fr/dyn/17/amendements/1906A/AN/2531" target="_blank" rel="noopener noreferrer" className="underline hover:text-text-secondary">
              Amendement I-2531
            </a>
            {" "}— voté oct. 2025
          </p>
        )}
        {gm === "A" && <p className="text-[10px] text-text-tertiary mt-1">Visible en mode B uniquement</p>}
      </div>

      <div className="mt-auto pt-4 border-t border-border-subtle">
        <p className="text-[10px] text-text-tertiary leading-relaxed">
          Barème 2026 · Simulation simplifiée · Micro BNC · Valider avec un expert-comptable
        </p>
      </div>
    </aside>
  );
}

// Mobile header version
export function MobileHeader({ ca, setCa, parts, setParts, gm, setGm, isSeuilEtendu, setIsSeuilEtendu, isCapped }: SidebarProps) {
  return (
    <div className="lg:hidden border-b border-border-subtle bg-bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-base font-bold text-text-primary">Simulateur</h1>
          <p className="text-[10px] text-text-tertiary">Freelance · Barème 2026</p>
        </div>
        <div className="font-mono text-xl font-bold text-text-primary">{fmt(ca)}</div>
      </div>

      <CurrencyInput label="" value={ca} onChange={setCa} min={10_000} max={1_000_000} />
      {isCapped && <p className="text-[10px] text-tax mt-1">⚠ Micro plafonné à {fmt(MICRO_CAP)}</p>}

      <div className="flex gap-4 mt-4">
        <div className="flex-1">
          <div className="text-[10px] text-text-tertiary uppercase mb-1">Parts</div>
          <div className="flex gap-0.5">
            {[1, 1.5, 2, 2.5, 3].map(p => (
              <button key={p} onClick={() => setParts(p)}
                className={cn("flex-1 py-1.5 rounded text-xs font-semibold border",
                  parts === p ? "bg-text-primary text-bg-primary border-text-primary" : "text-text-tertiary border-border-subtle"
                )}>{p}</button>
            ))}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-text-tertiary uppercase mb-1">Mode</div>
          <div className="flex gap-0.5">
            {["A", "B"].map(v => (
              <button key={v} onClick={() => setGm(v)}
                className={cn("px-3 py-1.5 rounded text-xs font-semibold border",
                  gm === v ? "bg-text-primary text-bg-primary border-text-primary" : "text-text-tertiary border-border-subtle"
                )}>{v}</button>
            ))}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-text-tertiary uppercase mb-1">IS 15%</div>
          <div className="flex gap-0.5">
            {[false, true].map(v => (
              <button key={String(v)} onClick={() => setIsSeuilEtendu(v)}
                className={cn("px-2 py-1.5 rounded text-[10px] font-semibold border",
                  isSeuilEtendu === v ? "bg-text-primary/5 text-text-primary border-text-primary/20" : "text-text-tertiary border-border-subtle"
                )}>{v ? "100k" : "42.5k"}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
