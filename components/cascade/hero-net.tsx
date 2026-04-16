"use client"

import { fmt } from "@/lib/utils"
import { CheckCircle2 } from "lucide-react"

export interface HeroNetProps {
  net: number
  ca: number
  source?: string
}

export function HeroNet({ net, ca, source = "Barème officiel 2026" }: HeroNetProps) {
  const pct = ca > 0 ? ((net / ca) * 100).toFixed(1) : "0.0"

  return (
    <div
      className="text-center p-6 lg:p-8 rounded-xl border border-positive/30 bg-gradient-to-b from-positive/[0.06] to-transparent relative overflow-hidden hero-glow"
    >
      <CheckCircle2 size={20} className="text-positive mx-auto mb-2" aria-hidden="true" />
      <div className="text-[10px] uppercase tracking-widest text-positive/70 font-medium">
        Votre argent
      </div>
      <div
        className="font-mono font-bold text-[36px] lg:text-[48px] text-positive mt-1 leading-tight transition-all duration-500"
        aria-live="polite"
      >
        {fmt(net)}
      </div>
      <div className="font-mono text-sm text-text-secondary mt-2">
        {fmt(Math.round(net / 12))}/mois · {pct}% du CA
      </div>
      <div className="text-[10px] text-text-tertiary mt-3">
        {source} · /an
      </div>

      {/* sr-only live region */}
      <div aria-live="assertive" aria-atomic className="sr-only">
        Net après impôts: {Math.round(net).toLocaleString("fr-FR")} euros par an
      </div>
    </div>
  )
}
