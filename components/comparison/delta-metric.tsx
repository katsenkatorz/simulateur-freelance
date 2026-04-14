"use client"

import { fmt } from "@/lib/utils"
import { cn } from "@/lib/utils"

export interface DeltaMetricProps {
  amount: number
  reference: string
}

export function DeltaMetric({ amount, reference }: DeltaMetricProps) {
  if (amount === 0) return null

  const isPositive = amount > 0
  const prefix = isPositive ? "+" : ""

  return (
    <div
      aria-live="assertive"
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium",
        isPositive ? "text-positive bg-positive/10" : "text-negative bg-negative/10"
      )}
    >
      <span>{prefix}{fmt(amount)}</span>
      <span className="text-text-tertiary">vs {reference}</span>
    </div>
  )
}
