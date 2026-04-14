import type { Metadata } from "next"
import { Suspense } from "react"
import App from "@/components/simulateur"

export const metadata: Metadata = {
  title: "Simulateur SASU + Holding 2026 — Optimisation Fiscale",
  description: "SASU + Holding : réduisez impôts via dividendes multi-niveaux. Stratégie avancée, IS réduit. Simulateur gratuit 2026.",
  alternates: { canonical: "/holding" },
}

export default function HoldingPage() {
  return (
    <Suspense>
      <App />
    </Suspense>
  )
}
