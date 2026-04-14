"use client"

import { useMemo } from "react"
import { useQueryStates, parseAsInteger, parseAsFloat } from "nuqs"
import { CascadeFlow, HeroNet } from "@/components/cascade"
import { DeltaMetric } from "./delta-metric"
import { buildCascadeItems } from "@/lib/cascade-builder"
import { simMicro, simTNS_A, simSASU_A, mkMicro, mkTNS, mkSASU } from "@/lib/engine"
import { fmt } from "@/lib/utils"
import { CurrencyInput } from "@/components/ui/currency-input"
import { RangeSlider } from "@/components/ui/range-slider"

const STATUSES = [
  { id: "micro", label: "Micro", color: "var(--color-micro)" },
  { id: "eurl", label: "EURL", color: "var(--color-eurl)" },
  { id: "sasu", label: "SASU", color: "var(--color-sasu)" },
] as const

export function ComparisonPage() {
  const [{ ca, parts }, setQ] = useQueryStates({
    ca: parseAsInteger.withDefault(100000),
    parts: parseAsFloat.withDefault(1),
  })

  const sims = useMemo(() => {
    const micro = simMicro(ca, parts, 42500)
    const eurl = simTNS_A(ca, parts, "EURL", 42500)
    const sasu = simSASU_A(ca, parts, 42500)
    return {
      micro: { sim: micro, items: buildCascadeItems(micro, mkMicro(ca), ca) },
      eurl: { sim: eurl, items: buildCascadeItems(eurl, mkTNS(eurl.nr), ca) },
      sasu: { sim: sasu, items: buildCascadeItems(sasu, mkSASU(sasu.brut), ca) },
    }
  }, [ca, parts])

  const microNet = sims.micro.sim.net

  return (
    <div className="max-w-5xl mx-auto p-4 lg:p-8">
      {/* Shared CA input */}
      <div className="flex items-center gap-4 mb-8 max-w-md">
        <label className="text-xs text-text-tertiary uppercase tracking-wider shrink-0">CA HT</label>
        <CurrencyInput value={ca} onChange={(v) => setQ({ ca: v })} />
        <RangeSlider
          min={0} max={300000} step={5000} value={ca}
          onChange={(v) => setQ({ ca: v })}
          label="Chiffre d'affaires"
          valueText={fmt(ca)}
          className="flex-1"
        />
      </div>

      {/* Grid: 3 cascades side by side (desktop) / stacked (mobile) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {STATUSES.map((s) => {
          const data = sims[s.id as keyof typeof sims]
          const delta = data.sim.net - microNet

          return (
            <div key={s.id}>
              {/* Status header */}
              <div className="flex items-center justify-between mb-3">
                <h2
                  className="text-sm font-semibold"
                  style={{ color: s.color }}
                >
                  {s.label}
                </h2>
                {s.id !== "micro" && (
                  <DeltaMetric amount={delta} reference="Micro" />
                )}
              </div>

              {/* HeroNet */}
              <HeroNet net={data.sim.net} ca={ca} />

              {/* Cascade */}
              <div className="mt-4">
                <CascadeFlow items={data.items} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
