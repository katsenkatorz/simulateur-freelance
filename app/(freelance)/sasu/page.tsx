import type { Metadata } from "next"
import { Suspense } from "react"
import App from "@/components/simulateur"

export const metadata: Metadata = {
  title: "Simulateur SASU 2026 — Salaire, Dividendes, Optimisation",
  description: "SASU gratuit : simulez salaire dirigeant, dividendes, IS. Mode A (tout salaire) vs B (capitalisation). Barème 2026.",
  alternates: { canonical: "/sasu" },
}

export default function SASUPage() {
  return (
    <Suspense>
      <App defaultSel="sasu" />
    </Suspense>
  )
}
