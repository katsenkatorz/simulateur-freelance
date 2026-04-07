# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projet

Simulateur fiscal freelance — composant React (JSX) standalone qui compare 5 statuts juridiques français : Micro-entreprise, EI, EURL, SASU, SASU+Holding. Permet de visualiser le net après IR/IS selon le CA, le nombre de parts fiscales, le régime (IR/IS) et la stratégie (tout en salaire vs capitalisation).

## Structure

Un seul fichier : `Fiscal Comparison EU EURL SASU 100k.jsx`. Pas de package.json, pas de bundler, pas de tests. Le composant exporte `App` par défaut et utilise React (useState, useMemo) — il est conçu pour être importé dans un environnement React existant ou un playground (ex: val.town, CodeSandbox).

## Architecture du fichier

Le fichier s'organise en couches :

1. **Moteur fiscal** (lignes 1-96) — Fonctions de calcul pures :
   - `calcIR(revenuNet, parts)` : barème progressif IR 2024 avec quotient familial et plafonnement
   - `calcIS(profit)` : IS à taux réduit 15% (≤42 500€) puis 25%
   - `simMicro`, `simTNS_A/B`, `simSASU_A/B`, `simHolding` : simulateurs par statut. Mode A = tout en salaire, Mode B = salaire choisi + capitalisation (IS requis)
   - `retInfo`, `mkTNS`, `mkSASU`, `mkMicro` : calculs retraite et ventilation cotisations

2. **Visualisation SVG** (lignes 98-214) — Diagrammes de flux animés (CSS dash-array) :
   - `FlowSimple` : flux linéaire (Micro, EI/EURL/SASU mode A)
   - `FlowSplitG` : flux avec split salaire/capitalisation (mode B)
   - `FlowHoldingA/B` : flux SASU → Holding avec régime mère-fille

3. **Composants UI** (lignes 216-235) — Barres, lignes détail, tableaux cotisations, toggle

4. **App principale** (lignes 238-412) — State, orchestration des sims, rendu des cards et du détail

## Constantes fiscales clés

- `PASS = 46 368` (Plafond Annuel Sécurité Sociale)
- `MICRO_CAP = 77 700` (plafond micro-entreprise BNC)
- TNS ~43%, charges SASU ~77% du brut, IS 15%/25%
- Barème IR 2024 : 0% / 11% / 30% / 41% / 45%

## Conventions

- Toutes les valeurs sont annuelles en euros HT
- `fmt(n)` formate en "XX XXX €" (locale fr-FR)
- Les objets simulation retournent `{ ca, co, ir, net, ret, lines }` — `lines` alimente les composants d'affichage
- Chaque line a un type `t` : `"n"` neutre, `"s"` solde, `"c"` charge, `"x"` impôt
- Fonts externes : JetBrains Mono + Space Grotesk (Google Fonts)
