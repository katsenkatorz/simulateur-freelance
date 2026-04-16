"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Briefcase, User, GitCompare } from "lucide-react"

const profiles = [
  {
    href: "/salarie",
    icon: User,
    label: "Salarié(e)",
    desc: "CDI — coût employeur et net",
    color: "#6366f1",
  },
  {
    href: "/micro",
    icon: Briefcase,
    label: "Indépendant(e)",
    desc: "Micro, EI, EURL, SASU, Holding",
    color: "#60a5fa",
  },
  {
    href: "/comparer",
    icon: GitCompare,
    label: "Comparer",
    desc: "Freelance vs CDI vs Portage",
    color: "#22c55e",
  },
]

export function ProfileCards() {
  const [visible, setVisible] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVisible(true), 50); return () => clearTimeout(t) }, [])

  const reducedMotion = typeof window !== "undefined"
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <h1
        className="text-3xl lg:text-4xl font-bold text-text-primary text-center mb-4 transition-all duration-700"
        style={{
          opacity: visible || reducedMotion ? 1 : 0,
          transform: visible || reducedMotion ? "translateY(0)" : "translateY(-12px)",
        }}
      >
        Où va votre argent ?
      </h1>
      <p
        className="text-text-secondary text-center max-w-md mb-12 leading-relaxed text-sm lg:text-base transition-all duration-700 delay-100"
        style={{
          opacity: visible || reducedMotion ? 1 : 0,
          transform: visible || reducedMotion ? "translateY(0)" : "translateY(-8px)",
        }}
      >
        Visualisez en un instant le parcours de chaque euro — du coût total à ce qui arrive dans votre poche.
      </p>
      <div className="flex flex-col sm:flex-row gap-5 w-full max-w-xl">
        {profiles.map((p, i) => (
          <Link
            key={p.href}
            href={p.href}
            className="flex-1 flex flex-col items-center gap-4 p-8 bg-bg-card border border-border-default rounded-xl transition-all duration-300 cursor-pointer group hover:scale-[1.03] hover:-translate-y-1 active:scale-[0.98]"
            style={{
              borderColor: `color-mix(in srgb, ${p.color} 30%, transparent)`,
              opacity: visible || reducedMotion ? 1 : 0,
              transform: visible || reducedMotion ? undefined : "translateY(20px)",
              transitionDelay: reducedMotion ? "0ms" : `${200 + i * 120}ms`,
              transitionDuration: "500ms",
              transitionTimingFunction: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            }}
          >
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center transition-shadow duration-300"
              style={{
                background: `color-mix(in srgb, ${p.color} 12%, transparent)`,
                boxShadow: `0 0 0 0 ${p.color}00`,
              }}
            >
              <p.icon
                size={28}
                style={{ color: p.color }}
                className="transition-transform duration-300 group-hover:scale-110"
              />
            </div>
            <span className="text-base font-semibold text-text-primary">{p.label}</span>
            <span className="text-xs text-text-tertiary text-center leading-relaxed">{p.desc}</span>
          </Link>
        ))}
      </div>
      <p
        className="text-xs text-text-tertiary mt-16 transition-opacity duration-700"
        style={{
          opacity: visible || reducedMotion ? 1 : 0,
          transitionDelay: reducedMotion ? "0ms" : "700ms",
        }}
      >
        Barème officiel 2026 · Simulateur à but pédagogique
      </p>
    </div>
  )
}
