"use client"

import { useMemo } from "react"
import { useQueryStates, parseAsInteger, parseAsFloat } from "nuqs"
import { CascadeFlow, HeroNet } from "@/components/cascade"
import { buildCascadeItems } from "@/lib/cascade-builder"
import { simCDI, mkCDIPat, mkCDISal, fmt } from "@/lib/engine"
import { CurrencyInput } from "@/components/ui/currency-input"
import { RangeSlider } from "@/components/ui/range-slider"

export function CDISimulator() {
  const [{ brut, parts }, setQ] = useQueryStates({
    brut: parseAsInteger.withDefault(36000),
    parts: parseAsFloat.withDefault(1),
  })

  const sim = useMemo(() => simCDI(brut, parts), [brut, parts])
  const cotisItems = useMemo(() => [...mkCDIPat(brut), ...mkCDISal(brut)], [brut])
  const cascadeItems = useMemo(() => buildCascadeItems(sim, cotisItems, sim.coutEmployeur), [sim, cotisItems])

  return (
    <div className="max-w-[600px] mx-auto p-4 lg:p-8 space-y-6">
      {/* Controls */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <label className="text-xs text-text-tertiary uppercase tracking-wider shrink-0 w-24">Brut annuel</label>
          <CurrencyInput value={brut} onChange={(v) => setQ({ brut: v })} />
        </div>
        <RangeSlider
          min={15000} max={120000} step={1000} value={brut}
          onChange={(v) => setQ({ brut: v })}
          label="Salaire brut annuel"
          valueText={fmt(brut)}
        />
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
      <HeroNet net={sim.net} ca={sim.coutEmployeur} source="Barème CDI 2026" />
      <CascadeFlow items={cascadeItems} />

      <div className="text-center font-mono text-xs text-text-tertiary border border-dashed border-border-subtle rounded p-2.5">
        <span className="text-positive">✓</span>{" "}
        Patronal + Salarial + IR + Net = {fmt(sim.coutEmployeur)}
      </div>
    </div>
  )
}
