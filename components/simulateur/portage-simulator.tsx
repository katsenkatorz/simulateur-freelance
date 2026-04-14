"use client"

import { useMemo } from "react"
import { useQueryStates, parseAsInteger, parseAsFloat } from "nuqs"
import { CascadeFlow, HeroNet } from "@/components/cascade"
import { buildCascadeItems } from "@/lib/cascade-builder"
import { simPortage, mkCDIPat, mkCDISal, fmt } from "@/lib/engine"
import { CurrencyInput } from "@/components/ui/currency-input"
import { RangeSlider } from "@/components/ui/range-slider"

export function PortageSimulator() {
  const [{ ca, parts, frais }, setQ] = useQueryStates({
    ca: parseAsInteger.withDefault(100000),
    parts: parseAsFloat.withDefault(1),
    frais: parseAsFloat.withDefault(0.08),
  })

  const sim = useMemo(() => simPortage(ca, parts, frais), [ca, parts, frais])
  const cotisItems = useMemo(() => [...mkCDIPat(sim.brut), ...mkCDISal(sim.brut)], [sim.brut])
  const cascadeItems = useMemo(() => buildCascadeItems(sim, cotisItems, ca), [sim, cotisItems, ca])

  return (
    <div className="max-w-[600px] mx-auto p-4 lg:p-8 space-y-6">
      {/* Controls */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <label className="text-xs text-text-tertiary uppercase tracking-wider shrink-0 w-24">CA annuel</label>
          <CurrencyInput value={ca} onChange={(v) => setQ({ ca: v })} />
        </div>
        <RangeSlider
          min={20000} max={200000} step={5000} value={ca}
          onChange={(v) => setQ({ ca: v })}
          label="Chiffre d'affaires annuel"
          valueText={fmt(ca)}
        />
        <div className="flex items-center gap-3">
          <label className="text-xs text-text-tertiary uppercase tracking-wider shrink-0 w-24">Frais gestion</label>
          <RangeSlider
            min={5} max={15} step={1} value={Math.round(frais * 100)}
            onChange={(v) => setQ({ frais: v / 100 })}
            label="Frais de gestion portage"
            valueText={`${Math.round(frais * 100)}%`}
          />
          <span className="font-mono text-sm text-text-secondary w-10">{Math.round(frais * 100)}%</span>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs text-text-tertiary uppercase tracking-wider shrink-0 w-24">Parts fiscales</label>
          <RangeSlider
            min={1} max={5} step={0.5} value={parts}
            onChange={(v) => setQ({ parts: v })}
            label="Parts fiscales"
            valueText={`${parts} part${parts > 1 ? 's' : ''}`}
          />
          <span className="font-mono text-sm text-text-secondary w-8">{parts}</span>
        </div>
      </div>

      {/* Cascade */}
      <HeroNet net={sim.net} ca={ca} source="Barème Portage 2026" />
      <CascadeFlow items={cascadeItems} />

      <div className="text-center font-mono text-xs text-text-tertiary border border-dashed border-border-subtle rounded p-2.5">
        <span className="text-positive">✓</span>{" "}
        Frais + Cotisations + IR + Net = {fmt(ca)}
      </div>
    </div>
  )
}
