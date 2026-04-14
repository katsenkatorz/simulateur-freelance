// Contextual recommendations per status
// "Ce statut est fait pour vous si..."

export interface Recommendation {
  title: string
  bullets: string[]
}

const RECS: Record<string, Recommendation> = {
  micro: {
    title: "La micro-entreprise est faite pour vous si",
    bullets: [
      "Votre CA annuel reste sous 77 700 € (BNC)",
      "Vous cherchez la simplicité administrative maximale",
      "Vos charges réelles sont faibles (pas de gros investissements)",
      "Vous débutez votre activité freelance",
    ],
  },
  ei: {
    title: "L'entreprise individuelle est faite pour vous si",
    bullets: [
      "Vos charges réelles dépassent 34% du CA (abattement micro insuffisant)",
      "Vous voulez déduire vos frais réels (bureau, matériel, déplacements)",
      "Vous hésitez entre IR et IS selon votre situation familiale",
    ],
  },
  eurl: {
    title: "L'EURL est faite pour vous si",
    bullets: [
      "Vous voulez séparer patrimoine personnel et professionnel",
      "Vous envisagez de capitaliser des bénéfices en société (IS)",
      "Vous prévoyez une croissance et souhaitez un cadre juridique solide",
    ],
  },
  sasu: {
    title: "La SASU est faite pour vous si",
    bullets: [
      "Vous voulez le statut d'assimilé salarié (meilleure protection sociale)",
      "Vous envisagez de vous verser des dividendes (flat tax 30%)",
      "Vous prévoyez de lever des fonds ou intégrer des associés",
      "Vous voulez cumuler avec des allocations chômage (ARE)",
    ],
  },
  holding: {
    title: "La SASU + Holding est faite pour vous si",
    bullets: [
      "Votre CA dépasse 150 000 € et vous optimisez la fiscalité",
      "Vous voulez profiter du régime mère-fille (95% dividendes exonérés)",
      "Vous réinvestissez les bénéfices dans d'autres activités",
      "Vous préparez une stratégie patrimoniale long terme",
    ],
  },
}

export function getRecommendation(sel: string): Recommendation | null {
  return RECS[sel] || null
}
