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
    <aside className="w-[280px] shrink-0 h-[calc(100vh-3.5rem)] overflow-y-auto border-r border-border-subtle bg-bg-primary p-4 flex flex-col gap-4 max-lg:hidden">
      {/* Card 1: Ma situation */}
      <div className="bg-bg-card border border-[#363636] rounded-lg p-4 space-y-4">
        <div className="text-[10px] font-medium text-text-tertiary uppercase tracking-wider">Ma situation</div>
        <CurrencyInput label="CA annuel HT" value={ca} onChange={setCa} min={10_000} max={sel === "micro" ? MICRO_CAP : 1_000_000} />
        {isCapped && sel === "micro" && (
          <p className="text-[11px] text-tax flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-tax" />
            Micro plafonné à {fmt(MICRO_CAP)}
          </p>
        )}

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
                    ? "bg-accent/15 text-accent border-accent/40"
                    : "bg-transparent text-text-tertiary border-border-subtle hover:border-border-default"
                )}
              >
                {p}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-text-tertiary mt-1.5">1 = célibataire · 2 = couple · +0.5 par enfant</p>
        </div>
      </div>

      {/* Card 2: Paramètres avancés */}
      <div className="bg-bg-card border border-[#363636] rounded-lg p-4 space-y-4">
      {/* Stratégie */}
      <div>
        <SectionLabel icon={Target}>Rémunération</SectionLabel>
        <div className="flex gap-1">
          {[
            { v: "A", l: "Tout en salaire" },
            { v: "B", l: "Garder en société" },
          ].map(o => {
            const isDisabled = o.v === "B" && sel === "micro";
            return (
            <button
              key={o.v}
              onClick={() => !isDisabled && setGm(o.v)}
              disabled={isDisabled}
              title={isDisabled ? "Non disponible en micro-entreprise" : undefined}
              className={cn(
                "flex-1 py-2 rounded-md text-sm font-semibold transition-all duration-200 border",
                isDisabled
                  ? "opacity-30 cursor-not-allowed text-text-tertiary border-border-subtle"
                  : gm === o.v
                  ? "bg-text-primary/5 text-text-primary border-text-primary/20"
                  : "bg-transparent text-text-tertiary border-border-subtle hover:border-border-default"
              )}
            >
              {o.l}
            </button>
          )})}
        </div>
      </div>

      {/* Seuil IS */}
      <div>
        <SectionLabel icon={Scale}>Taux IS réduit (15%)</SectionLabel>
        <div className="flex gap-1">
          {[
            { v: false, l: "42 500 € (en vigueur)" },
            { v: true, l: "100 000 € (PLF 2026)" },
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

      </div>

      {/* Footer */}
      <div className="mt-auto pt-4">
        <p className="text-[10px] text-text-tertiary leading-relaxed">
          Simulation indicative · Vérifiez avec un expert-comptable
        </p>
      </div>
    </aside>
  );
}

// Mobile version
export function MobileControls({
  ca, setCa, parts, setParts, gm, setGm, isSeuilEtendu, setIsSeuilEtendu, isCapped, sel,
  regEI, setRegEI, regEURL, setRegEURL, regSASU, setRegSASU,
}: Pick<SidebarProps, "ca" | "setCa" | "parts" | "setParts" | "gm" | "setGm" | "isSeuilEtendu" | "setIsSeuilEtendu" | "isCapped" | "sel" | "regEI" | "setRegEI" | "regEURL" | "setRegEURL" | "regSASU" | "setRegSASU">) {
  const currentRegime = sel === "ei" ? regEI : sel === "eurl" ? regEURL : sel === "sasu" ? regSASU : null;
  const setCurrentRegime = sel === "ei" ? setRegEI : sel === "eurl" ? setRegEURL : sel === "sasu" ? setRegSASU : null;
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
                  parts === p ? "bg-accent/15 text-accent border-accent/40" : "text-text-tertiary border-border-subtle"
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
                  gm === v ? "bg-accent/15 text-accent border-accent/40" : "text-text-tertiary border-border-subtle"
                )}>{label}</button>
            ))}
          </div>
        </div>
        {/* Regime fiscal toggle — mobile */}
        {currentRegime && setCurrentRegime && (
          <div>
            <div className="text-[10px] text-text-tertiary uppercase mb-1">Régime</div>
            <div className="flex gap-0.5">
              {[
                { v: "IR", l: "IR (perso)" },
                { v: "IS", l: "IS (société)" },
              ].map(o => (
                <button key={o.v} onClick={() => setCurrentRegime(o.v)}
                  className={cn("flex-1 py-1.5 rounded text-[10px] font-semibold border",
                    currentRegime === o.v ? "bg-accent/15 text-accent border-accent/40" : "text-text-tertiary border-border-subtle"
                  )}>{o.l}</button>
              ))}
            </div>
          </div>
        )}
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
