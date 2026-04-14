import type { Metadata } from "next"
import { Suspense } from "react"
import App from "@/components/simulateur"

export const metadata: Metadata = {
  title: "Simulateur EURL 2026 — Rémunération, Dividendes et IS",
  description: "EURL : calculez salaire gérant, dividendes, IS. Stratégie A (salaire) vs B (capitalisation). Comparez SASU, micro, EI.",
  alternates: { canonical: "/eurl" },
}

export default function EURLPage() {
  return (
    <Suspense>
      <App />
    </Suspense>
  )
}
