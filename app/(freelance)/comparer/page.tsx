import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Comparer Statuts Freelance — Micro vs EURL vs SASU 2026",
  description: "Quel statut freelance choisir ? Comparez micro-entreprise, EI, EURL, SASU. Simulateur gratuit, net après impôts, comparatif 2026.",
  alternates: { canonical: "/comparer" },
}

export default function ComparerPage() {
  return (
    <div className="max-w-[600px] mx-auto p-6 lg:p-8 text-center">
      <h1 className="text-xl font-bold text-text-primary mb-4">Comparateur de statuts</h1>
      <p className="text-sm text-text-secondary">
        Comparaison côte à côte disponible dans une prochaine mise à jour (Epic 7).
      </p>
    </div>
  )
}
