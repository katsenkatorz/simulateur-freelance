"use client"

import Link from "next/link"
import { Briefcase, User, GitCompare } from "lucide-react"

const profiles = [
  {
    href: "/salarie",
    icon: User,
    label: "Salarié(e)",
    desc: "CDI — coût employeur et net",
  },
  {
    href: "/micro",
    icon: Briefcase,
    label: "Indépendant(e)",
    desc: "Micro, EI, EURL, SASU, Holding",
  },
  {
    href: "/comparer",
    icon: GitCompare,
    label: "Comparer",
    desc: "CDI vs Freelance vs Portage",
  },
]

export function ProfileCards() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <h1 className="text-2xl lg:text-3xl font-bold text-text-primary text-center mb-3">
        Où va votre argent ?
      </h1>
      <p className="text-text-secondary text-center max-w-md mb-10 leading-relaxed">
        Visualisez en un instant le parcours de chaque euro — du coût total à ce qui arrive dans votre poche.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg">
        {profiles.map((p) => (
          <Link
            key={p.href}
            href={p.href}
            className="flex-1 flex flex-col items-center gap-3 p-6 bg-bg-card border border-border-subtle rounded-lg hover:border-accent hover:bg-bg-elevated transition-all cursor-pointer group"
          >
            <p.icon
              size={28}
              className="text-text-secondary group-hover:text-accent transition-colors"
            />
            <span className="text-sm font-medium text-text-primary">{p.label}</span>
            <span className="text-xs text-text-tertiary text-center">{p.desc}</span>
          </Link>
        ))}
      </div>
      <p className="text-xs text-text-tertiary mt-12">
        Barème officiel 2026 · Simulateur à but pédagogique
      </p>
    </div>
  )
}
