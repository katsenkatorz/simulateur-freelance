"use client"

import { useState, useEffect, useRef } from "react"
import { CascadeCard, type CascadeItemType } from "./cascade-card"
import { CascadeDetail, type DetailRow } from "./cascade-detail"
import type { LucideIcon } from "lucide-react"

export interface CascadeItem {
  icon: LucideIcon
  label: string
  sublabel?: string
  amount: number
  percentage: number
  type: CascadeItemType
  detail?: DetailRow[]
}

export interface CascadeFlowProps {
  items: CascadeItem[]
  className?: string
}

export function CascadeFlow({ items, className }: CascadeFlowProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const [visible, setVisible] = useState(false)
  const containerRef = useRef<HTMLUListElement>(null)

  // Trigger stagger animation on mount or items change
  useEffect(() => {
    setVisible(false)
    const timer = setTimeout(() => setVisible(true), 10)
    return () => clearTimeout(timer)
  }, [items])

  function handleTap(index: number) {
    setExpandedIndex(expandedIndex === index ? null : index)
  }

  const reducedMotion = typeof window !== "undefined"
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches

  return (
    <ul
      ref={containerRef}
      role="list"
      aria-label="Décomposition de votre rémunération"
      className={className}
    >
      {items.map((item, i) => (
        <li key={i} role="presentation" className="list-none">
          {/* Connector line between cards */}
          {i > 0 && (
            <div
              className="w-0.5 h-3 lg:h-4 bg-border-subtle mx-auto transition-opacity duration-300"
              style={{
                opacity: visible || reducedMotion ? 1 : 0,
                transitionDelay: reducedMotion ? "0ms" : `${i * 80}ms`,
              }}
            />
          )}

          {/* Card with stagger */}
          <div
            className="transition-all duration-500"
            style={{
              opacity: visible || reducedMotion ? 1 : 0,
              transform: visible || reducedMotion ? "translateY(0)" : "translateY(12px)",
              transitionDelay: reducedMotion ? "0ms" : `${i * 80}ms`,
              transitionTimingFunction: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            }}
          >
            <CascadeCard
              icon={item.icon}
              label={item.label}
              sublabel={item.sublabel}
              amount={item.amount}
              percentage={item.percentage}
              type={item.type}
              index={i}
              isExpanded={expandedIndex === i}
              isDimmed={expandedIndex !== null && expandedIndex !== i}
              onTap={() => handleTap(i)}
            >
              {item.detail && item.detail.length > 0 && (
                <CascadeDetail rows={item.detail} />
              )}
            </CascadeCard>
          </div>
        </li>
      ))}
    </ul>
  )
}
