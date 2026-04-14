"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const statuses = [
  { href: "/micro", label: "Micro", color: "var(--color-micro)" },
  { href: "/ei", label: "EI", color: "var(--color-ei)" },
  { href: "/eurl", label: "EURL", color: "var(--color-eurl)" },
  { href: "/sasu", label: "SASU", color: "var(--color-sasu)" },
  { href: "/holding", label: "SASU+Holding", color: "var(--color-holding)" },
]

export function StatusNav() {
  const pathname = usePathname()

  return (
    <nav aria-label="Choisir un statut" className="flex gap-1.5 overflow-x-auto scrollbar-none py-1">
      {statuses.map((s) => {
        const isActive = pathname === s.href
        return (
          <Link
            key={s.href}
            href={s.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap",
              isActive
                ? "text-text-primary"
                : "text-text-secondary border-border-subtle hover:border-border-default hover:text-text-primary"
            )}
            style={isActive ? {
              borderColor: s.color,
              color: s.color,
              background: `color-mix(in srgb, ${s.color} 10%, transparent)`,
            } : undefined}
          >
            {s.label}
          </Link>
        )
      })}
    </nav>
  )
}
