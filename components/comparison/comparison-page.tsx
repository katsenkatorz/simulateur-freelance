"use client"

import { useMemo, useState } from "react"
import { useQueryStates, parseAsInteger, parseAsFloat } from "nuqs"
import { CascadeFlow, HeroNet } from "@/components/cascade"
import { DeltaMetric } from "./delta-metric"
import { buildCascadeItems } from "@/lib/cascade-builder"
import { simMicro, simTNS_A, simSASU_A, mkMicro, mkTNS, mkSASU } from "@/lib/engine"
import { fmt } from "@/lib/utils"
import { CurrencyInput } from "@/components/ui/currency-input"
import { RangeSlider } from "@/components/ui/range-slider"
import { cn } from "@/lib/utils"

const STATUSES = [
  { id: "micro", label: "Micro", color: "var(--color-micro)", hex: "#60a5fa" },
  { id: "eurl", label: "EURL", color: "var(--color-eurl)", hex: "#34d399" },
  { id: "sasu", label: "SASU", color: "var(--color-sasu)", hex: "#a78bfa" },
] as const

export function ComparisonPage() {
  const [{ ca, parts }, setQ] = useQueryStates({
    ca: parseAsInteger.withDefault(100000),
    parts: parseAsFloat.withDefault(1),
  })
  const [mobileTab, setMobileTab] = useState<string>("micro")

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
      <div className="flex items-center gap-4 mb-6 max-w-md">
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

      {/* Summary bar — always visible, shows all 3 NETs on one line */}
      <div className="flex gap-2 mb-6 p-3 bg-bg-card border border-border-subtle rounded-lg">
        {STATUSES.map((s) => {
          const data = sims[s.id as keyof typeof sims]
          const delta = data.sim.net - microNet
          return (
            <button
              key={s.id}
              onClick={() => setMobileTab(s.id)}
              className={cn(
                "flex-1 text-center p-2 rounded-md transition-all",
                mobileTab === s.id ? "bg-bg-elevated" : "hover:bg-bg-elevated/50"
              )}
            >
              <div className="text-[10px] uppercase tracking-wider font-medium" style={{ color: s.hex }}>{s.label}</div>
              <div className="font-mono font-bold text-sm text-text-primary mt-0.5">{fmt(data.sim.net)}</div>
              {s.id !== "micro" && (
                <div className={cn("text-[10px] font-mono mt-0.5", delta >= 0 ? "text-positive" : "text-negative")}>
                  {delta >= 0 ? "+" : ""}{fmt(delta)}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Desktop: 3 columns. Mobile: show selected tab only */}
      <div className="hidden lg:grid lg:grid-cols-3 gap-6">
        {STATUSES.map((s) => {
          const data = sims[s.id as keyof typeof sims]
          const delta = data.sim.net - microNet
          return (
            <div key={s.id}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold" style={{ color: s.color }}>{s.label}</h2>
                {s.id !== "micro" && <DeltaMetric amount={delta} reference="Micro" />}
              </div>
              <HeroNet net={data.sim.net} ca={ca} />
              <div className="mt-4"><CascadeFlow items={data.items} /></div>
            </div>
          )
        })}
      </div>

      {/* Mobile: single cascade for selected tab */}
      <div className="lg:hidden">
        {STATUSES.filter(s => s.id === mobileTab).map((s) => {
          const data = sims[s.id as keyof typeof sims]
          return (
            <div key={s.id}>
              <HeroNet net={data.sim.net} ca={ca} />
              <div className="mt-4"><CascadeFlow items={data.items} /></div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
