# Project Context — Simulateur Freelance

## Vue d'ensemble

Simulateur fiscal freelance comparant 5 statuts juridiques français (Micro BNC, EI, EURL, SASU, SASU+Holding) sur barème fiscal 2026. App 100% client-side, pas de backend/API/DB.

## Stack technique

| Composant | Version | Usage |
|-----------|---------|-------|
| Next.js | 16.2.2 | App Router, Turbopack |
| React | 19.2.4 | UI |
| TypeScript | 5.x | Typage strict |
| Tailwind CSS | 4.2.2 | Styling via `@tailwindcss/postcss` |
| shadcn/ui | 4.2.0 | Composants UI (`components/ui/`) |
| Recharts | 3.8.0 | Bar charts, treemaps |
| @nivo/sankey | 0.99.0 | Diagrammes Sankey |
| @xyflow/react | 12.10.2 | Flow diagrams interactifs |
| nuqs | 2.8.9 | Persistance state dans URL |
| animejs | 4.3.6 | Animations numériques |
| lucide-react | 1.8.0 | Icones |

**Package manager** : npm
**Deployment** : Vercel (auto-deploy GitHub)
**Fonts** : JetBrains Mono (`--font-jetbrains`), Inter (`--font-inter`) via `next/font/google`

## Architecture fichiers

```
app/
  layout.tsx              # Fonts + metadata + NuqsAdapter
  page.tsx                # Server component → <Suspense><App /></Suspense>
  globals.css             # Tailwind v4 + CSS variables couleurs

components/
  simulateur/
    index.tsx             # Composant principal "use client" (~460 lignes)
    comparison-mini.tsx   # Mini barres comparaison
    repartition-bar.tsx   # Barre répartition
    treemap-detail.tsx    # Détail treemap
  layout/
    header.tsx            # Header + sélecteur statut
    sidebar.tsx           # Sidebar filtres (CA, parts, toggles)
  comparison/
    sankey-overview.tsx   # Vue Sankey
    structure-card.tsx    # Card structure juridique
  detail/
    flow-tab.tsx          # Onglet flow diagram
  flow/
    custom-edge.tsx       # Edge custom @xyflow
    custom-node.tsx       # Node custom @xyflow
    flow-config.ts        # Config flow
  ui/                     # shadcn components (badge, button, card, chart, etc.)

lib/
  fiscal.ts               # Constantes fiscales 2026 centralisées
  engine.ts               # Fonctions de calcul pures (simMicro, simTNS, simSASU, simHolding...)
  sankey.ts               # Transformations données → Sankey
  types.ts                # Types TypeScript (SimResult, Line, etc.)
  utils.ts                # Utilitaires (fmt, cn)

hooks/
  use-animated-number.ts  # Hook animation numérique
```

## Domaine métier — Fiscalité freelance française

### 5 régimes simulés

| Régime | Type cotisations | IS possible | Mode B (capitalisation) |
|--------|-----------------|-------------|------------------------|
| Micro BNC | Forfaitaire 25.6% | Non | Non |
| EI (Entreprise Individuelle) | TNS ~43% | Oui (option) | Oui si IS |
| EURL | TNS ~43% | Oui | Oui si IS |
| SASU | Salarié ~77% | Oui | Oui |
| SASU + Holding | Salarié + IS holding | Oui | Oui |

### 2 modes par régime

- **Mode A** : tout en rémunération (salaire/TNS)
- **Mode B** : capitalisation via IS (bénéfice laissé en société, taxé à l'IS)

### Constantes clés (`lib/fiscal.ts`)

- PASS : 48 060 EUR
- Barème IR 2026 : 5 tranches (0% → 45%)
- IS : 15% jusqu'au seuil (42 500 EUR standard / 100 000 EUR PLF 2026), 25% au-delà
- Micro BNC : 25.6% cotisations, 34% abattement forfaitaire
- Micro = BNC uniquement, jamais BIC

## Conventions de code

### Valeurs

- Toutes les valeurs sont **annuelles en euros HT**
- `fmt(n)` formate en "XX XXX EUR" (locale `fr-FR`)

### Types

```typescript
interface SimResult {
  ca: number;    // Chiffre d'affaires
  co: number;    // Cotisations
  ir: number;    // Impôt sur le revenu
  net: number;   // Net après impôts
  ret: number;   // Retraite (trimestres)
  lines: Line[]; // Détail ligne par ligne
}

interface Line {
  l: string;     // Label
  v: number;     // Valeur
  t: "n" | "s" | "c" | "x"; // n=neutre, s=solde, c=charge, x=impôt
}
```

### Architecture logique

- **Calculs purs** dans `lib/engine.ts` : zéro side effects, zéro imports UI
- **Constantes** dans `lib/fiscal.ts` : mises à jour annuellement
- **Transformations data** dans `lib/sankey.ts` : SimResult → données Sankey/Treemap
- **State** via `nuqs` : tous les paramètres (CA, parts, régime, mode, seuil) dans l'URL
- **UI** dans `components/` : séparation domaine / layout / visualisation / shadcn

### Style

- Theme monochrome sombre avec accents colorés par régime :
  - Micro : `--color-micro` (blue)
  - EI : `--color-ei` (cyan)
  - EURL : `--color-eurl` (green)
  - SASU : `--color-sasu` (purple)
  - Holding : `--color-holding` (amber)
- CSS variables définies dans `app/globals.css` via `@theme`

### Git

- Commits en **anglais**
- Branch principale : `main`
- Branch de développement actuelle : `redesign`

## Évolutions prévues

- Intégration de données fiscales officielles (APIs ou scraping impots.gouv, URSSAF)
- Ajout de tests (unitaires pour engine.ts, intégration pour futures APIs)
