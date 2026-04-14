import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Simulateur Portage Salarial 2026 — Frais & Net Gagné",
  description: "Portage salarial : simulez frais gestion, net, cotisations. Vs freelance, SASU, micro-entreprise. Gratuit 2026.",
  alternates: { canonical: "/portage" },
}

export default function PortagePage() {
  return (
    <div className="max-w-[600px] mx-auto p-6 lg:p-8 text-center">
      <h1 className="text-xl font-bold text-text-primary mb-4">Simulateur Portage Salarial</h1>
      <p className="text-sm text-text-secondary">
        Simulateur portage salarial disponible dans une prochaine mise à jour (Epic 10).
      </p>
    </div>
  )
}
