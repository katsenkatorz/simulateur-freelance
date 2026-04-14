import type { Metadata } from "next"
import { Suspense } from "react"
import { ComparisonPage } from "@/components/comparison/comparison-page"

export const metadata: Metadata = {
  title: "Comparer Statuts Freelance — Micro vs EURL vs SASU 2026",
  description: "Quel statut freelance choisir ? Comparez micro-entreprise, EURL, SASU côte à côte. Net après impôts, comparatif 2026.",
  alternates: { canonical: "/comparer" },
}

export default function ComparerPage() {
  return (
    <Suspense>
      <ComparisonPage />
    </Suspense>
  )
}
