"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const statuses = [
  { href: "/micro", label: "Micro-entreprise", short: "Micro", color: "#60a5fa" },
  { href: "/ei", label: "Entreprise Individuelle", short: "EI", color: "#2dd4bf" },
  { href: "/eurl", label: "EURL", short: "EURL", color: "#34d399" },
  { href: "/sasu", label: "SASU", short: "SASU", color: "#a78bfa" },
  { href: "/holding", label: "SASU + Holding", short: "Holding", color: "#fbbf24" },
]

export function StatusNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const current = statuses.find(s => s.href === pathname) || statuses[0]

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      {/* Breadcrumb: Simulateur > [Current Status ▾] */}
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:bg-bg-elevated"
      >
        <span className="text-text-tertiary text-xs hidden sm:inline">Simulateur ›</span>
        <span style={{ color: current.color }}>{current.short}</span>
        <ChevronDown size={14} className={cn("text-text-tertiary transition-transform", open && "rotate-180")} />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          role="listbox"
          aria-label="Choisir un statut"
          className="absolute top-full left-0 mt-1 w-56 bg-bg-card border border-border-default rounded-lg shadow-xl z-50 py-1 overflow-hidden"
        >
          {statuses.map(s => {
            const isActive = s.href === pathname
            return (
              <Link
                key={s.href}
                href={s.href}
                role="option"
                aria-selected={isActive}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                  isActive ? "bg-bg-elevated" : "hover:bg-bg-elevated/50"
                )}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: s.color }}
                />
                <span className={cn("font-medium", isActive ? "text-text-primary" : "text-text-secondary")}>
                  {s.label}
                </span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
