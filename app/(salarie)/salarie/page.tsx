import type { Metadata } from "next"
import { Suspense } from "react"
import { CDISimulator } from "@/components/simulateur/cdi-simulator"

export const metadata: Metadata = {
  title: "Simulateur Salaire CDI 2026 — Coût Employeur & Net",
  description: "Calculez votre net du salaire brut. Cotisations patronales, salariales, impôt sur le revenu. CDI cadre 2026.",
  alternates: { canonical: "/salarie" },
}

export default function SalariePage() {
  return (
    <Suspense>
      <CDISimulator />
    </Suspense>
  )
}
