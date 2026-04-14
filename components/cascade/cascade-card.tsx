"use client"

import { cn } from "@/lib/utils"
import { fmt } from "@/lib/utils"
import { ChevronDown } from "lucide-react"
import type { LucideIcon } from "lucide-react"

export type CascadeItemType = "ca" | "charge" | "tax" | "net"

export interface CascadeCardProps {
  icon: LucideIcon
  label: string
  sublabel?: string
  amount: number
  percentage: number
  type: CascadeItemType
  index: number
  isExpanded: boolean
  isDimmed: boolean
  onTap: () => void
  children?: React.ReactNode
}

const TYPE_COLORS: Record<CascadeItemType, string> = {
  ca: "var(--color-accent)",
  charge: "var(--color-negative)",
  tax: "var(--color-tax)",
  net: "var(--color-positive)",
}

const TYPE_TINTS: Record<CascadeItemType, string> = {
  ca: "from-accent/[0.10]",
  charge: "from-negative/[0.10]",
  tax: "from-tax/[0.10]",
  net: "from-positive/[0.10]",
}

const TYPE_TEXT: Record<CascadeItemType, string> = {
  ca: "text-text-primary",
  charge: "text-negative",
  tax: "text-tax",
  net: "text-positive",
}

export function CascadeCard({
  icon: Icon,
  label,
  sublabel,
  amount,
  percentage,
  type,
  index,
  isExpanded,
  isDimmed,
  onTap,
  children,
}: CascadeCardProps) {
  const prefix = amount < 0 ? "- " : ""
  const displayAmount = prefix + fmt(Math.abs(amount))

  return (
    <div
      role="button"
      tabIndex={0}
      aria-expanded={isExpanded}
      aria-controls={`cascade-detail-${index}`}
      aria-label={`${label}: ${Math.abs(amount).toLocaleString("fr-FR")} euros, ${percentage.toFixed(1)} pourcent du chiffre d'affaires`}
      className={cn(
        "rounded-lg border border-[#363636] p-4 lg:p-5 cursor-pointer",
        "transition-all duration-300",
        `bg-gradient-to-br ${TYPE_TINTS[type]} to-bg-card`,
        "border-l-4",
        isDimmed && "opacity-40",
        "hover:brightness-105",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
      )}
      style={{
        borderLeftColor: TYPE_COLORS[type],
        transitionDelay: `${index * 80}ms`,
      }}
      onClick={onTap}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onTap() }
        if (e.key === "Escape" && isExpanded) { e.preventDefault(); onTap() }
      }}
    >
      {/* Header: icon + label + amount */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: `color-mix(in srgb, ${TYPE_COLORS[type]} 12%, transparent)` }}
          >
            <Icon size={16} style={{ color: TYPE_COLORS[type] }} aria-hidden="true" />
          </div>
          <div>
            <div className="text-sm font-medium text-text-secondary">{label}</div>
            {sublabel && <div className="text-xs text-text-tertiary mt-0.5">{sublabel}</div>}
          </div>
        </div>
        <div className="text-right">
          <div className={cn("font-mono font-bold text-lg lg:text-[18px]", TYPE_TEXT[type])}>
            {displayAmount}
          </div>
          <div className="font-mono text-xs text-text-tertiary mt-0.5">
            {percentage.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Expand affordance */}
      {children && (
        <ChevronDown
          size={14}
          className={cn(
            "absolute top-4 right-4 text-text-tertiary transition-transform duration-300",
            isExpanded && "rotate-180"
          )}
        />
      )}

      {/* Proportional bar */}
      <div className="mt-3 h-2 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${Math.min(Math.max(percentage, 0), 100)}%`,
            background: TYPE_COLORS[type],
            transitionDelay: `${index * 80}ms`,
          }}
        />
      </div>

      {/* Detail panel (tap-to-reveal) */}
      {children && (
        <div
          id={`cascade-detail-${index}`}
          role="region"
          aria-live="polite"
          aria-atomic={false}
          className={cn(
            "overflow-hidden transition-all duration-300",
            isExpanded ? "max-h-[500px] opacity-100 mt-4" : "max-h-0 opacity-0 mt-0"
          )}
        >
          {children}
        </div>
      )}
    </div>
  )
}
