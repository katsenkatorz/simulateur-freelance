"use client"

import { fmt } from "@/lib/utils"

export interface HeroNetProps {
  net: number
  ca: number
  source?: string
}

export function HeroNet({ net, ca, source = "Barème officiel 2026" }: HeroNetProps) {
  const pct = ca > 0 ? ((net / ca) * 100).toFixed(1) : "0.0"

  return (
    <div className="text-center p-5 lg:p-6 bg-bg-card border border-[#363636] rounded-lg">
      <div className="text-xs uppercase tracking-wider text-text-secondary">
        Vous gardez
      </div>
      <div
        className="font-mono font-bold text-[32px] lg:text-[40px] text-positive mt-2"
        aria-live="polite"
      >
        {fmt(net)}<span className="text-lg lg:text-xl text-text-tertiary ml-1">/an</span>
      </div>
      <div className="font-mono text-sm text-text-secondary mt-1">
        {fmt(Math.round(net / 12))}/mois · {pct}% du CA
      </div>
      <div className="text-xs text-text-tertiary mt-2">
        {source}
      </div>

      {/* sr-only live region for assertive NET announcement */}
      <div aria-live="assertive" aria-atomic className="sr-only">
        Net après impôts: {Math.round(net).toLocaleString("fr-FR")} euros
      </div>
    </div>
  )
}
