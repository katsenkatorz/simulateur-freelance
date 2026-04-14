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
          {/* Flow arrow between cards */}
          {i > 0 && (
            <div
              className="flex justify-center transition-opacity duration-300"
              style={{
                opacity: visible || reducedMotion ? 1 : 0,
                transitionDelay: reducedMotion ? "0ms" : `${i * 80}ms`,
              }}
            >
              <svg width="24" height="28" viewBox="0 0 24 28" className="block" aria-hidden="true">
                <defs>
                  <linearGradient id={`flow-grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={items[i-1]?.type === 'ca' ? 'var(--color-accent)' : items[i-1]?.type === 'charge' ? 'var(--color-negative)' : items[i-1]?.type === 'tax' ? 'var(--color-tax)' : 'var(--color-positive)'} stopOpacity="0.5" />
                    <stop offset="100%" stopColor={item.type === 'charge' ? 'var(--color-negative)' : item.type === 'tax' ? 'var(--color-tax)' : item.type === 'net' ? 'var(--color-positive)' : 'var(--color-accent)'} stopOpacity="0.5" />
                  </linearGradient>
                </defs>
                <line x1="12" y1="0" x2="12" y2="20" stroke={`url(#flow-grad-${i})`} strokeWidth="2" className="flow-arrow-line" style={{ animationDelay: `${i * 200}ms` }} />
                <polygon points="7,18 17,18 12,26" fill={item.type === 'charge' ? 'var(--color-negative)' : item.type === 'tax' ? 'var(--color-tax)' : item.type === 'net' ? 'var(--color-positive)' : 'var(--color-accent)'} opacity="0.7">
                  <animate attributeName="opacity" values="0.4;0.8;0.4" dur="1.5s" repeatCount="indefinite" begin={`${i * 0.2}s`} />
                </polygon>
              </svg>
            </div>
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
