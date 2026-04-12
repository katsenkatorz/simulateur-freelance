# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projet

Simulateur fiscal freelance — app Next.js 16 (TypeScript, App Router) qui compare 5 statuts juridiques français : Micro-entreprise BNC, EI, EURL, SASU, SASU+Holding. Barème fiscal 2026. Visualise le net après IR/IS selon le CA, parts fiscales, régime (IR/IS), stratégie (tout en salaire vs capitalisation) et seuil IS (42.5k standard ou 100k PLF 2026).

## Commandes

```bash
npm run dev     # Dev server (Turbopack)
npm run build   # Build production
npm run start   # Serveur production
```

## Architecture

```
app/layout.tsx                    # Fonts (next/font/google) + metadata + NuqsAdapter
app/page.tsx                      # Server component → <Suspense><App /></Suspense>
app/globals.css                   # Tailwind v4 + CSS variables couleurs

components/simulateur/index.tsx   # Composant principal "use client" (~460 lignes)
components/layout/                # Header, Sidebar
components/comparison/            # Sankey, StructureCard
components/detail/                # FlowTab
components/flow/                  # Custom nodes/edges @xyflow
components/ui/                    # shadcn components

lib/fiscal.ts                     # Constantes fiscales 2026 centralisées
lib/engine.ts                     # Fonctions de calcul pures (zéro side effects)
lib/sankey.ts                     # Transformations SimResult → Sankey/Treemap
lib/types.ts                      # Types TypeScript (SimResult, Line, etc.)
lib/utils.ts                      # Utilitaires (fmt, cn)

hooks/use-animated-number.ts      # Hook animation numérique
```

### `lib/fiscal.ts` — Constantes fiscales 2026

Toutes les constantes sont extraites ici pour faciliter les mises à jour annuelles :
- PASS, plafond micro BNC, barème IR (tranches), plafond QF
- Taux cotisations micro (25.6%), TNS (~43%), SASU (~77%)
- IS : seuil standard (42 500 €) + seuil PLF 2026 (100 000 €, toggle UI)
- Seuils trimestres retraite

### `lib/engine.ts` — Moteur fiscal

Fonctions de calcul pures :
- `calcIR(revenuNet, parts)` : barème progressif IR 2026 avec quotient familial
- `calcIS(profit, seuil)` : IS 15%/25% avec seuil paramétrique
- `simMicro`, `simTNS_A/B`, `simSASU_A/B`, `simHolding` : simulateurs par statut
- Mode A = tout en salaire, Mode B = capitalisation (IS requis)

## Conventions

- Toutes les valeurs sont annuelles en euros HT
- `fmt(n)` formate en "XX XXX €" (locale fr-FR)
- Les objets simulation retournent `{ ca, co, ir, net, ret, lines }`
- Chaque line a un type `t` : `"n"` neutre, `"s"` solde, `"c"` charge, `"x"` impôt
- Fonts via CSS variables : `var(--font-jetbrains)`, `var(--font-space-grotesk)`
- Micro-entreprise = BNC (abattement 34%), pas BIC
- Commits in English

## BMAD Method

This project uses [BMAD Method](https://github.com/bmad-code-org/BMAD-METHOD) (v6.3.0) for structured AI-driven development.

- **Project context** : `_bmad-output/project-context.md` — stack, conventions, domain rules
- **Track** : Quick Flow (tech-spec → stories → implementation)
- **Agents** : `bmad-help` (guidance), `bmad-agent-pm` (stories), `bmad-agent-dev` (implementation), `bmad-agent-architect` (technical decisions)
- **Workflows** : `bmad-create-story` → `bmad-dev-story`, `bmad-code-review`, `bmad-check-implementation-readiness`
