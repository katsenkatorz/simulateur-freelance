"use client";

import { cn } from "@/lib/utils";
import { CurrencyInput } from "@/components/ui/currency-input";
import { RangeSlider } from "@/components/ui/range-slider";
import { MICRO_CAP } from "@/lib/fiscal";
import { fmt } from "@/lib/engine";
import { Users, Target, Scale, Briefcase, Wallet } from "lucide-react";

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
  // Status-specific
  sel: string;
  regEI: string;
  setRegEI: (v: string) => void;
  regEURL: string;
  setRegEURL: (v: string) => void;
  regSASU: string;
  setRegSASU: (v: string) => void;
  salB: number;
  setSalB: (v: number) => void;
  mandatM: number;
  setMandatM: (v: number) => void;
  maxSalB: number;
  maxMandat: number;
  isB: boolean;
}

function SectionLabel({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-[11px] font-medium text-text-tertiary uppercase tracking-wider mb-2">
      <Icon size={12} aria-hidden="true" />
      {children}
    </div>
  );
}

export function Sidebar({
  ca, setCa, parts, setParts, gm, setGm, isSeuilEtendu, setIsSeuilEtendu, isCapped,
  sel, regEI, setRegEI, regEURL, setRegEURL, regSASU, setRegSASU,
  salB, setSalB, mandatM, setMandatM, maxSalB, maxMandat, isB,
}: SidebarProps) {
  const showRegimeToggle = sel === "ei" || sel === "eurl" || sel === "sasu";
  const currentReg = sel === "ei" ? regEI : sel === "eurl" ? regEURL : regSASU;
  const setCurrentReg = sel === "ei" ? setRegEI : sel === "eurl" ? setRegEURL : setRegSASU;

  const regimeOptions = sel === "ei"
    ? [{ v: "IR", l: "IR" }, { v: "IS", l: "IS (2022)" }]
    : sel === "eurl"
    ? [{ v: "IR", l: "IR" }, { v: "IS", l: "IS" }]
    : [{ v: "IR", l: "IR (5 ans)" }, { v: "IS", l: "IS" }];

  return (
    <aside className="w-[260px] shrink-0 h-[calc(100vh-3.5rem)] overflow-y-auto border-r border-border-subtle bg-bg-card p-5 flex flex-col gap-6 max-lg:hidden">
      {/* CA */}
      <div>
        <CurrencyInput label="CA annuel HT" value={ca} onChange={setCa} min={10_000} max={1_000_000} />
        {isCapped && sel === "micro" && (
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
                "flex-1 py-2 rounded-md text-sm font-semibold transition-all duration-200 border",
                parts === p
                  ? "bg-text-primary text-bg-primary border-text-primary"
                  : "bg-transparent text-text-tertiary border-border-subtle hover:border-border-default"
              )}
            >
              {p}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-text-tertiary mt-1.5">1 = célib · 2 = couple · +0.5/enfant</p>
      </div>

      {/* Stratégie */}
      <div>
        <SectionLabel icon={Target}>Stratégie</SectionLabel>
        <div className="flex gap-1">
          {[
            { v: "A", l: "Salaire" },
            { v: "B", l: "Capitaliser" },
          ].map(o => (
            <button
              key={o.v}
              onClick={() => setGm(o.v)}
              className={cn(
                "flex-1 py-2 rounded-md text-sm font-semibold transition-all duration-200 border",
                gm === o.v
                  ? "bg-text-primary/5 text-text-primary border-text-primary/20"
                  : "bg-transparent text-text-tertiary border-border-subtle hover:border-border-default"
              )}
            >
              {o.l}
            </button>
          ))}
        </div>
      </div>

      {/* Seuil IS */}
      <div>
        <SectionLabel icon={Scale}>Seuil IS 15%</SectionLabel>
        <div className="flex gap-1">
          {[
            { v: false, l: "42 500 €" },
            { v: true, l: "100 000 €" },
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
          <div className="mt-2 p-2.5 bg-bg-elevated/50 rounded-md">
            <p className="text-[10px] text-text-tertiary leading-relaxed">
              <a href="https://www.assemblee-nationale.fr/dyn/17/amendements/1906A/AN/2531" target="_blank" rel="noopener noreferrer" className="underline hover:text-text-secondary">
                Amendement I-2531
              </a>
              {" "}— voté en 1ère lecture (oct. 2025). Non promulgué à ce jour. Le seuil IS à taux réduit passerait de 42 500 € à 100 000 €.
            </p>
          </div>
        )}
      </div>

      {/* Separator — params spécifiques au statut */}
      <div className="h-px bg-border-default" />

      {/* Régime fiscal (per-status) */}
      {showRegimeToggle && (
        <div>
          <SectionLabel icon={Briefcase}>Régime fiscal</SectionLabel>
          <div className="flex gap-1">
            {regimeOptions.map(o => (
              <button
                key={o.v}
                onClick={() => setCurrentReg(o.v)}
                className={cn(
                  "flex-1 py-2 rounded-md text-xs font-semibold transition-all duration-200 border",
                  currentReg === o.v
                    ? "bg-text-primary/5 text-text-primary border-text-primary/20"
                    : "bg-transparent text-text-tertiary border-border-subtle hover:border-border-default"
                )}
              >
                {o.l}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mandat présidence (Holding only) */}
      {sel === "holding" && (
        <div>
          <SectionLabel icon={Briefcase}>Mandat présidence</SectionLabel>
          <div className="flex justify-between items-baseline mb-1.5">
            <span className="text-xs text-text-tertiary">Rémunération</span>
            <span className="text-sm font-bold font-mono text-text-primary">{fmt(mandatM)}<span className="text-text-tertiary font-normal text-[10px]">/mois</span></span>
          </div>
          <RangeSlider min={1000} max={Math.max(maxMandat, 2000)} step={500} value={mandatM} onChange={setMandatM} />
        </div>
      )}

      {/* Salaire gérant (Mode B only) */}
      {isB && (
        <div>
          <SectionLabel icon={Wallet}>Salaire gérant</SectionLabel>
          <div className="flex justify-between items-baseline mb-1.5">
            <span className="text-xs text-text-tertiary">Net mensuel</span>
            <span className="text-sm font-bold font-mono text-text-primary">{fmt(Math.round(salB / 12))}<span className="text-text-tertiary font-normal text-[10px]">/mois</span></span>
          </div>
          <RangeSlider min={6000} max={maxSalB} step={1200} value={salB} onChange={setSalB} />
          <div className="flex justify-between text-[10px] text-text-tertiary mt-1">
            <span>{fmt(6000)}/an</span>
            <span>{fmt(maxSalB)}/an</span>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto pt-4 border-t border-border-subtle">
        <p className="text-[10px] text-text-tertiary leading-relaxed">
          Simulation simplifiée · Micro BNC (34%) · Valider avec un expert-comptable
        </p>
      </div>
    </aside>
  );
}

// Mobile version
export function MobileControls({
  ca, setCa, parts, setParts, gm, setGm, isSeuilEtendu, setIsSeuilEtendu, isCapped, sel,
}: Pick<SidebarProps, "ca" | "setCa" | "parts" | "setParts" | "gm" | "setGm" | "isSeuilEtendu" | "setIsSeuilEtendu" | "isCapped" | "sel">) {
  return (
    <div className="lg:hidden border-b border-border-subtle bg-bg-card p-4">
      <CurrencyInput label="" value={ca} onChange={setCa} min={10_000} max={1_000_000} />
      {isCapped && sel === "micro" && <p className="text-[10px] text-tax mt-1">Micro plafonné à {fmt(MICRO_CAP)}</p>}
      <div className="flex gap-4 mt-3">
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
            {([["A", "Salaire"], ["B", "Capital"]] as const).map(([v, label]) => (
              <button key={v} onClick={() => setGm(v)}
                aria-label={`Mode ${label}`}
                className={cn("px-3 py-1.5 rounded text-xs font-semibold border",
                  gm === v ? "bg-text-primary text-bg-primary border-text-primary" : "text-text-tertiary border-border-subtle"
                )}>{label}</button>
            ))}
          </div>
        </div>
        {/* IS threshold toggle — accessible on mobile */}
        {sel !== "micro" && (
          <div className="mt-2">
            <button
              onClick={() => setIsSeuilEtendu(!isSeuilEtendu)}
              aria-label={isSeuilEtendu ? "Seuil IS 100k activé" : "Seuil IS standard 42.5k"}
              className={cn(
                "w-full py-1.5 rounded text-[10px] font-medium border transition-all",
                isSeuilEtendu
                  ? "bg-accent/10 text-accent border-accent/30"
                  : "text-text-tertiary border-border-subtle"
              )}
            >
              Seuil IS {isSeuilEtendu ? "100k (PLF 2026)" : "42,5k"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
