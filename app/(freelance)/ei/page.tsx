import type { Metadata } from "next"
import { Suspense } from "react"
import App from "@/components/simulateur"

export const metadata: Metadata = {
  title: "Simulateur Entreprise Individuelle (EI) 2026 — IR vs IS",
  description: "EI gratuit : simulez salaire, impôts (IR/IS), cotisations TNS. Comparez micro-entreprise, EURL, SASU. Barème 2026.",
  alternates: { canonical: "/ei" },
}

export default function EIPage() {
  return (
    <Suspense>
      <App />
    </Suspense>
  )
}
