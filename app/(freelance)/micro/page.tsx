import type { Metadata } from "next"
import { Suspense } from "react"
import App from "@/components/simulateur"

export const metadata: Metadata = {
  title: "Simulateur Micro-Entreprise BNC 2026 — Calculez Votre Net",
  description: "Simulateur micro-entreprise gratuit. Calculez votre revenu net, impôts, cotisations sociales. Micro BNC 2026 — Comparez avec EURL, SASU.",
  alternates: { canonical: "/micro" },
}

export default function MicroPage() {
  return (
    <Suspense>
      <App defaultSel="micro" />
    </Suspense>
  )
}
