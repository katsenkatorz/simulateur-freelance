"use client";

import { cn } from "@/lib/utils";
import { CurrencyInput } from "@/components/ui/currency-input";
import { IS_SEUIL_REDUIT, IS_SEUIL_PLF2026, MICRO_CAP } from "@/lib/fiscal";
import { fmt } from "@/lib/engine";
import { Users, Target, Scale, ChevronRight } from "lucide-react";

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
    <div className="flex items-center gap-2 text-xs font-medium text-text-secondary uppercase tracking-wider mb-2">
      <Icon size={14} className="text-text-tertiary" />
      {children}
    </div>
  );
}

export function Sidebar({ ca, setCa, parts, setParts, gm, setGm, isSeuilEtendu, setIsSeuilEtendu, isCapped }: SidebarProps) {
  return (
    <aside className="w-[280px] shrink-0 sticky top-0 h-screen overflow-y-auto border-r border-border-subtle bg-bg-card p-6 flex flex-col gap-8">
      {/* Logo / Titre */}
      <div>
        <h1 className="text-lg font-bold text-text-primary tracking-tight">Simulateur</h1>
        <p className="text-xs text-text-tertiary mt-0.5">Freelance · Barème 2026</p>
      </div>

      {/* CA */}
      <div>
        <CurrencyInput
          label="Chiffre d'affaires annuel HT"
          value={ca}
          onChange={setCa}
          min={10_000}
          max={1_000_000}
        />
        {isCapped && (
          <p className="text-[11px] text-tax mt-2 flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-tax" />
            Micro plafonné à {fmt(MICRO_CAP)}
          </p>
        )}
      </div>

      {/* Parts IR */}
      <div>
        <SectionLabel icon={Users}>Parts fiscales</SectionLabel>
        <div className="flex gap-1">
          {[1, 1.5, 2, 2.5, 3].map(p => (
            <button
              key={p}
              onClick={() => setParts(p)}
              className={cn(
                "flex-1 py-2 rounded-md text-sm font-semibold transition-all duration-200",
                "border",
                parts === p
                  ? "bg-accent text-white border-accent"
                  : "bg-transparent text-text-tertiary border-border-subtle hover:border-border-default hover:text-text-secondary"
              )}
            >
              {p}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-text-tertiary mt-1.5">1 = célibataire · 2 = couple · +0.5/enfant</p>
      </div>

      {/* Stratégie */}
      <div>
        <SectionLabel icon={Target}>Stratégie</SectionLabel>
        <div className="flex flex-col gap-1.5">
          <button
            onClick={() => setGm("A")}
            className={cn(
              "w-full py-2.5 px-3 rounded-lg text-sm font-medium text-left transition-all duration-200",
              "border flex items-center justify-between",
              gm === "A"
                ? "bg-accent/10 text-accent border-accent/30"
                : "bg-transparent text-text-tertiary border-border-subtle hover:border-border-default"
            )}
          >
            <div>
              <div className="font-semibold">Tout en salaire</div>
              <div className="text-[10px] text-text-tertiary mt-0.5">100% en rémunération</div>
            </div>
            {gm === "A" && <ChevronRight size={16} className="text-accent" />}
          </button>
          <button
            onClick={() => setGm("B")}
            className={cn(
              "w-full py-2.5 px-3 rounded-lg text-sm font-medium text-left transition-all duration-200",
              "border flex items-center justify-between",
              gm === "B"
                ? "bg-accent/10 text-accent border-accent/30"
                : "bg-transparent text-text-tertiary border-border-subtle hover:border-border-default"
            )}
          >
            <div>
              <div className="font-semibold">Capitaliser</div>
              <div className="text-[10px] text-text-tertiary mt-0.5">Salaire + capital en société (IS)</div>
            </div>
            {gm === "B" && <ChevronRight size={16} className="text-accent" />}
          </button>
        </div>
      </div>

      {/* Seuil IS */}
      <div>
        <SectionLabel icon={Scale}>Seuil IS 15%</SectionLabel>
        <div className="flex gap-1.5">
          <button
            onClick={() => setIsSeuilEtendu(false)}
            className={cn(
              "flex-1 py-2 rounded-md text-xs font-semibold transition-all duration-200",
              "border",
              !isSeuilEtendu
                ? "bg-accent/10 text-accent border-accent/30"
                : "bg-transparent text-text-tertiary border-border-subtle hover:border-border-default"
            )}
          >
            ≤ 42 500 €
          </button>
          <button
            onClick={() => setIsSeuilEtendu(true)}
            className={cn(
              "flex-1 py-2 rounded-md text-xs font-semibold transition-all duration-200",
              "border",
              isSeuilEtendu
                ? "bg-tax/10 text-tax border-tax/30"
                : "bg-transparent text-text-tertiary border-border-subtle hover:border-border-default"
            )}
          >
            ≤ 100 000 €
          </button>
        </div>
        {isSeuilEtendu && (
          <p className="text-[10px] text-tax mt-1.5">
            <a href="https://www.assemblee-nationale.fr/dyn/17/amendements/1906A/AN/2531" target="_blank" rel="noopener noreferrer" className="underline">
              Amendement I-2531
            </a>
            {" "}— voté oct. 2025, promulgation fin 2026.
          </p>
        )}
        {gm === "A" && (
          <p className="text-[10px] text-text-tertiary mt-1">Visible en mode capitalisation uniquement</p>
        )}
      </div>

      {/* Footer */}
      <div className="mt-auto pt-4 border-t border-border-subtle">
        <p className="text-[10px] text-text-tertiary leading-relaxed">
          Barème 2026 · Simulation simplifiée · Micro BNC (abattement 34%) · Valider avec un expert-comptable
        </p>
      </div>
    </aside>
  );
}
