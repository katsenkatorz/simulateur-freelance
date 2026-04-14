import type { Metadata } from "next"
import { Suspense } from "react"
import { PortageSimulator } from "@/components/simulateur/portage-simulator"

export const metadata: Metadata = {
  title: "Simulateur Portage Salarial 2026 — Frais & Net Gagné",
  description: "Portage salarial : simulez frais gestion, cotisations, net. Comparez avec freelance, SASU, micro. Gratuit 2026.",
  alternates: { canonical: "/portage" },
}

export default function PortagePage() {
  return (
    <Suspense>
      <PortageSimulator />
    </Suspense>
  )
}
