import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Simulateur Salaire CDI 2026 — Coût Employeur & Net",
  description: "Calculez votre net du salaire brut. Cotisations, impôt prélevé à la source, net après IR. CDI 2026.",
  alternates: { canonical: "/salarie" },
}

export default function SalariePage() {
  return (
    <div className="max-w-[600px] mx-auto p-6 lg:p-8 text-center">
      <h1 className="text-xl font-bold text-text-primary mb-4">Simulateur CDI</h1>
      <p className="text-sm text-text-secondary">
        Simulateur salarié CDI disponible dans une prochaine mise à jour (Epic 9).
      </p>
    </div>
  )
}
