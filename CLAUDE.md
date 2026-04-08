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
app/layout.tsx          # Fonts (next/font/google) + metadata
app/page.tsx            # Server component → importe <App />
app/globals.css         # Reset minimal
components/simulateur.tsx  # Composant principal ("use client", ~500 lignes)
lib/fiscal.ts           # Constantes fiscales 2026 centralisées
```

### `lib/fiscal.ts` — Constantes fiscales 2026

Toutes les constantes sont extraites ici pour faciliter les mises à jour annuelles :
- PASS, plafond micro BNC, barème IR (tranches), plafond QF
- Taux cotisations micro (25.6%), TNS (~43%), SASU (~77%)
- IS : seuil standard (42 500 €) + seuil PLF 2026 (100 000 €, toggle UI)
- Seuils trimestres retraite

### `components/simulateur.tsx` — Composant principal

Organisé en couches :

1. **Moteur fiscal** — Fonctions de calcul pures :
   - `calcIR(revenuNet, parts)` : barème progressif IR 2026 avec quotient familial
   - `calcIS(profit, seuil)` : IS 15%/25% avec seuil paramétrique
   - `simMicro`, `simTNS_A/B`, `simSASU_A/B`, `simHolding` : simulateurs par statut
   - Mode A = tout en salaire, Mode B = capitalisation (IS requis)

2. **Visualisation SVG** — Diagrammes de flux animés (CSS dash-array) :
   - `FlowSimple`, `FlowSplitG`, `FlowHoldingA/B`

3. **Composants UI** — `Bar`, `LI`, `BarsViz`, `Toggle`, `CotisT`, `RetB`, `CapUsage`

4. **App** — State, orchestration des sims, rendu des cards + détail

## Conventions

- Toutes les valeurs sont annuelles en euros HT
- `fmt(n)` formate en "XX XXX €" (locale fr-FR)
- Les objets simulation retournent `{ ca, co, ir, net, ret, lines }`
- Chaque line a un type `t` : `"n"` neutre, `"s"` solde, `"c"` charge, `"x"` impôt
- Fonts via CSS variables : `var(--font-jetbrains)`, `var(--font-space-grotesk)`
- Micro-entreprise = BNC (abattement 34%), pas BIC
