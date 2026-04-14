---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
lastStep: 8
status: complete
completedAt: '2026-04-14'
inputDocuments:
  - '_bmad-output/planning-artifacts/prd.md'
  - '_bmad-output/planning-artifacts/ux-design-specification.md'
  - '_bmad-output/planning-artifacts/architecture.md'
  - '_bmad-output/project-context.md'
workflowType: 'architecture'
project_name: 'simulateur-freelance'
user_name: 'Jeff'
date: '2026-04-14'
---

# Architecture Decision Document — Simulateur de Rémunération v2

_This document builds collaboratively through step-by-step discovery. It replaces the v1 architecture document (2026-04-12) with updated decisions from the UX design workflow._

**Previous architecture:** `_bmad-output/planning-artifacts/architecture.md` (v1, pre-UX decisions)

## Project Context Analysis

### Requirements Overview

**45 Functional Requirements** in 9 groups: Fiscal Engine (10), Visual Comprehension (5), Navigation (3), Shareability (3), Education (4), Accessibility (5), SEO (3), Administration (3), UX/Robustness (7).

**26 Non-Functional Requirements** in 6 categories: Performance (LCP <2.5s, INP <200ms, bundle <200KB, first result <100ms), Accessibility (RGAA 4.1, 0 axe-core violations), Reliability (100% accuracy, ±1€), SEO (sitemap, canonical, structured data), Scalability (CDN, code splitting), Privacy (zero storage, cookie-free).

### Architecture-Defining UX Decisions

| Decision | Source | Architectural Impact |
|----------|--------|---------------------|
| Sankey REMOVED | UX spec step 5 | Delete @nivo/sankey + D3 (-80KB), delete `lib/sankey.ts` |
| Cascade Flow = hero viz | UX spec step 5-9 | New component tree: CascadeFlow/Card/Detail. CSS transitions + anime.js. Zero new deps |
| @xyflow KEPT as pedagogical "wow" viz | Party mode discussion | Lazy-loaded exploration mode for complex structures (SASU+Holding, Mode B). Beautiful animated schema showing capital flows. NOT the default view |
| MPA routing | PRD | Per-simulator routes: /, /freelance, /salarie, /portage |
| Monolith split | UX spec step 11 | 462-line index.tsx → 8+ focused components |
| `Sim = any` → discriminated union | Architecture v1 | Type safety across entire codebase |

### Two-Layer Visualization Architecture

**Layer 1 — Cascade Flow (default, all users):**
Vertical cards showing CA → deductions → NET. CSS transitions + anime.js. Mobile-native. The "answer" to "where does my money go?" Loads instantly (0KB extra).

**Layer 2 — Pedagogical Flow (exploration, complex statuses):**
@xyflow/react animated schema showing HOW money flows through entities (SASU operating company → holding, dividends, IS, mandate remuneration). The "wow" feature — beautiful animated nodes with particle-like money flowing along curves. Lazy-loaded via `next/dynamic` (+60KB on demand only).

**Access:** Contextual button "Comprendre la mécanique" appears in cascade view only for complex statuses (not Micro alone). Transition: cascade fades, flow expands from center. Both views stay synchronized with same params (CA, parts, regime).

**Visual direction (from creative review):**
- Central node: CA amount with pulsing aura, status accent color
- Branches: SVG bézier curves, semi-transparent, glow on hover
- Animated particles flowing along branches (speed/density proportional to amounts)
- Satellite nodes: distinctive shapes per type (diamond for holding, circle for remuneration, etc.)
- Sequential reveal animation on load (~3s total)
- Mobile fallback: simplified vertical flow or accordion

### Scale & Complexity

- **Primary domain:** Client-side web app (fiscal computation + data visualization)
- **Complexity:** Medium — multiple tax regimes, pure client-side, zero backend
- **Components:** ~15-20 (engine, cascade, flow, comparison, navigation, controls, charts)
- **Data model:** Pure computation (no persistence, no network, no real-time)

### Technical Constraints

1. **100% client-side** — no API routes, no server actions, no database
2. **Next.js 16 App Router** — static generation, Turbopack dev
3. **Solo developer** — simple architecture, no abstraction overload
4. **Brownfield** — migration path from current monolith required
5. **Fiscal accuracy** — engine must be auditable, testable, independently runnable
6. **Tests BEFORE refactoring** — golden dataset + 100% engine coverage required

### Cross-Cutting Concerns

1. **URL state (nuqs)** — all params in URL, shared across simulators. Each route is independent, state via URL params
2. **Animation** — CSS transitions (cascade) + @xyflow (pedagogical flow) + anime.js (numbers). Consistent timing. `prefers-reduced-motion` respected
3. **Accessibility** — RGAA 4.1 patterns on every component. `<ul>` → `<li role="presentation">` → `<div role="button">` for cascade. aria-controls, aria-live, sr-only tables
4. **Design tokens** — zinc monochrome + semantic colors, consumed by CSS vars and JS (`lib/colors.ts` new)
5. **Fiscal constants** — single source of truth (`lib/fiscal.ts`), annual update
6. **Type safety** — replace `Sim = any` with discriminated union

### Migration Strategy (from Party Mode consensus)

**Approach: Incremental by layers, NOT rewrite.**

| Phase | Action | Risk | Prerequisite |
|-------|--------|------|-------------|
| 0 — Tests | Write engine.ts unit tests, golden dataset, CI gate | 0/10 | None |
| 1 — Cleanup | Delete sankey.ts, sankey-overview.tsx, dead shadcn, @base-ui | 0/10 | None |
| 2 — Types | Replace `Sim = any` with discriminated union | 2/10 | Phase 0 (tests catch regressions) |
| 3 — Extract | Split index.tsx into CascadeFlow, StatusPills, HeroNet, etc. | 2/10 | Phase 2 (types guide extraction) |
| 4 — Routes | Add MPA routes (/freelance, /salarie, /portage) | 3/10 | Phase 3 (components stable) |
| 5 — Flow viz | Build pedagogical @xyflow view, lazy-loaded | 3/10 | Phase 3 (cascade working) |
| 6 — CDI + Portage | New simulator engines + cascade instances | 3/10 | Phase 4 (routing in place) |

**@xyflow decision:** Flow-tab.tsx + flow/ directory are cleanly isolated (1 import in index.tsx). Can be removed and re-built independently. Current implementation kept as reference for v2 flow viz.

## Stack Formalization (Brownfield)

### Current Stack — Keep

| Layer | Technology | Version | Role in v2 |
|-------|-----------|---------|-----------|
| Framework | Next.js | 16.2.2 | App Router, Turbopack, static generation, MPA routing |
| UI | React | 19.2.4 | Latest stable |
| Language | TypeScript | 5.x strict | Full type safety (after `Sim = any` fix) |
| Styling | Tailwind CSS | 4.2.2 | Utility-first, design tokens via `@theme` |
| Components | shadcn/ui | 4.2.0 | Curated subset (currency-input, range-slider, chart) |
| Charts | Recharts | 3.8.0 | ComparisonMini bars, RepartitionBar, TreemapDetail |
| Flow viz | @xyflow/react | 12.10.2 | Pedagogical flow — lazy-loaded, "wow" animated schema |
| URL state | nuqs | 2.8.9 | All params in URL, per-route independent state |
| Animations | anime.js | 4.3.6 | Animated number counters (useAnimatedNumber). Reserved for numeric transitions only — all other animations use CSS transitions |
| Icons | lucide-react | 1.8.0 | Consistent icon set |
| Package mgr | npm | �� | Lockfile committed |
| Deploy | Vercel | — | Auto-deploy from GitHub main branch |

### Dependencies to REMOVE

| Package | Reason | Savings |
|---------|--------|---------|
| @nivo/sankey | Sankey viz removed (UX decision) | ~80KB gzip (includes D3 transitive) |
| @base-ui/react | Only consumed by 7 dead shadcn components | ~15KB gzip |
| class-variance-authority | Only consumed by dead shadcn components (badge, button, tabs) | ~5KB gzip |

**Total savings: ~100KB gzip** (from ~260KB to ~160KB estimated)

### Dead Code to DELETE

| File | Lines | Reason |
|------|-------|--------|
| `lib/sankey.ts` | 148 | Sankey transformations, no consumers after removal |
| `components/comparison/sankey-overview.tsx` | 62 | Sankey wrapper, dead |
| `components/comparison/structure-card.tsx` | 79 | Replaced by ComparisonMini in redesign, zero imports |
| `hooks/use-animated-number.ts` | 29 | Only imported by dead structure-card.tsx. To be REWRITTEN for cascade (same name, new implementation using anime.js for cascade counters) |
| `components/ui/badge.tsx` | — | Dead shadcn, zero external imports |
| `components/ui/button.tsx` | — | Dead shadcn, zero external imports |
| `components/ui/card.tsx` | — | Dead shadcn, zero external imports |
| `components/ui/tabs.tsx` | — | Dead shadcn, zero external imports |
| `components/ui/slider.tsx` | — | Dead shadcn, zero external imports |
| `components/ui/separator.tsx` | — | Dead shadcn, zero external imports |
| `components/ui/tooltip.tsx` | — | Dead shadcn, zero external imports |

### anime.js Usage Policy

anime.js (17KB gzip) is kept for animated number transitions in the cascade flow. Policy:
- **Allowed usage:** `useAnimatedNumber` hook for counting animations on amounts when parameters change
- **Not for:** Layout animations, transitions, stagger effects (use CSS transitions)
- **Current state:** Only consumer (`hooks/use-animated-number.ts`) is dead code. Hook will be rewritten for cascade integration
- **Review trigger:** If unused after cascade implementation, remove

### Testing Stack (New)

| Tool | Purpose | Phase |
|------|---------|-------|
| Vitest | Unit tests (engine.ts, fiscal.ts), component tests | Phase 0 |
| Golden dataset (JSON) | Reference data verified against URSSAF/DGFiP, ~20-30 cases | Phase 0 |
| axe-core | Automated accessibility CI gate (0 violations) | Phase 1 |
| Lighthouse CI | Performance (>90) + Accessibility (>95) scores | Phase 1 |

**Vitest config:** `environment: 'node'` for engine tests, `environment: 'jsdom'` for component tests. Coverage target: 100% on `lib/engine.ts` and `lib/fiscal.ts`. Alias `@/` resolved via vite config.

**CI pipeline (GitHub Actions):** Unit tests → coverage gate → build → axe-core → Lighthouse. Runs on push to main and all PRs.

### Risks Identified (from review)

| Risk | Mitigation |
|------|-----------|
| Recharts CSS inline vs Tailwind v4 priority | Test chart rendering in production build before merge |
| nuqs + Next.js 16 cache sync | Integration test: URL params ↔ computed state |
| @xyflow lazy chunk size | Measure with `npm run build -- --analyze` |
| Version drift | Pin versions with `~` not `^` in package.json |
| Lucide tree-shaking | Verify no barrel import breaking optimization |

## Core Architectural Decisions

### Decision 1: Routing — Route Groups

**Choice:** Next.js App Router route groups `(freelance)` and `(salarie)`.

```
app/
├── layout.tsx                    # Root: fonts, NuqsAdapter, footer
├── page.tsx                      # Landing "Qui êtes-vous ?"
├── (freelance)/
│   ├── layout.tsx                # Header + sidebar freelance, StatusNav
│   ├── micro/page.tsx            # → /micro
│   ├── ei/page.tsx               # → /ei
│   ├── eurl/page.tsx             # → /eurl
│   ├── sasu/page.tsx             # → /sasu
│   ├── holding/page.tsx          # → /holding
│   └── comparer/page.tsx         # → /comparer
├── (salarie)/
│   ├── layout.tsx                # Header + sidebar salarié
│   ├── salarie/page.tsx          # → /salarie
│   └── portage/page.tsx          # → /portage
├── not-found.tsx
├── error.tsx
└── globals.css
```

**Rationale:** Route groups share layout without appearing in URL. Freelance statuses share header/sidebar/StatusNav. Salarié pages have their own adapted layout. Each `page.tsx` = Server Component → `<Suspense>` → Client simulator. Per-page metadata for SEO.

**Per-route URL params (nuqs):**
- `/micro` → `ca`, `parts`
- `/ei` → `ca`, `parts`, `regEI` (IR/IS)
- `/eurl` → `ca`, `parts`, `regEURL`, `gm` (mode A/B), `salB`
- `/sasu` → `ca`, `parts`, `regSASU`, `gm`, `salB`, `isSeuilEtendu`
- `/holding` → `ca`, `parts`, `gm`, `salB`, `mandatM`, `isSeuilEtendu`
- `/salarie` → `brut` (or `net`), `parts`
- `/portage` → `ca`, `parts`, `fraisGestion`
- `/comparer` → `ca`, `parts`, `statuts[]` (selected statuses to compare)

### Decision 2: Navigation — Pills-as-Links + Skeleton

**Choice:** StatusPills are `<Link>` components (Next.js client navigation). Skeleton animation during page transition.

```tsx
// components/controls/status-nav.tsx
import Link from 'next/link'

const statuses = [
  { href: '/micro', label: 'Micro', color: '--color-micro' },
  { href: '/ei', label: 'EI', color: '--color-ei' },
  { href: '/eurl', label: 'EURL', color: '--color-eurl' },
  { href: '/sasu', label: 'SASU', color: '--color-sasu' },
  { href: '/holding', label: 'Holding', color: '--color-holding' },
]

export function StatusNav({ current }: { current: string }) {
  return (
    <nav aria-label="Choisir un statut" className="flex gap-2">
      {statuses.map(s => (
        <Link key={s.href} href={s.href}
          className={current === s.href ? 'active' : ''}
          aria-current={current === s.href ? 'page' : undefined}>
          {s.label}
        </Link>
      ))}
    </nav>
  )
}
```

**Transition behavior:**
- Header + sidebar remain fixed (no visual change)
- Cascade zone fades out (100ms, opacity 1→0)
- New cascade staggers in (80ms per card, spring easing)
- Total perceived transition: ~400ms
- URL updates immediately (browser address bar shows new route)
- Back button works (browser history)

**CA preservation:** When navigating between freelance statuses, the `ca` param is carried via URL. `<Link href={`/sasu?ca=${currentCA}&parts=${currentParts}`}>`. Common params transfer; route-specific params use defaults.

### Decision 3: Comparison — Cascades Side-by-Side

**Choice:** `/comparer` page shows 2-3 cascades in columns (desktop) or swipeable tabs (mobile).

**Desktop (≥1024px):**
```
┌──────────┬──────────┬──────────┐
│  MICRO   │   SASU   │ HOLDING  │
│ 47 520 € │ 38 400 € │ 51 200 € │
│  ▓▓▓▓▓   │  ▓▓▓     │  ▓▓▓▓▓▓  │
│  ▓▓▓     │  ▓▓▓▓▓   │  ▓▓▓▓    │
│  ▓▓▓▓▓▓  │  ▓▓      │  ▓▓▓▓▓▓▓ │
└──────────┴──────────┴──────────┘
```

**Mobile (<640px):** Tabs at top (Micro | SASU | Holding), swipe between cascades. Delta metric visible: "+12,800€ vs SASU".

**Implementation:** Single `ComparisonPage` component that computes all selected engines, renders `<CascadeFlow>` instances in a responsive grid. Shared CA input at top drives all cascades.

### Decision 4: Transition — Fade + Stagger Cascade

**Choice:** Page transitions use fade out (100ms) + stagger cascade in (80ms × n cards).

**Implementation:**
- Next.js App Router handles client navigation (no full page reload)
- `loading.tsx` in `(freelance)/` shows skeleton cascade (gray placeholder cards)
- On page mount, cascade cards animate via CSS stagger (`transitionDelay: index * 80ms`)
- Header and sidebar are in the group layout → never re-render → stable
- `prefers-reduced-motion`: no animation, instant display

```tsx
// app/(freelance)/loading.tsx
export default function Loading() {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-16 bg-bg-elevated rounded-md" />
      ))}
    </div>
  )
}
```

### Decision 5: Pedagogical Flow — Contextual Button

**Choice:** "Comprendre la mécanique" button appears below the cascade, only for complex statuses (SASU, Holding, EURL+IS). Lazy-loads @xyflow on click.

**Visibility rules:**
- `/micro` → button hidden (flow is trivial: CA → abattement → cotis → IR → net)
- `/ei` with IR → button hidden (linear flow)
- `/ei` with IS → button visible (IS adds a branch)
- `/eurl` → button visible (mode A/B creates different flows)
- `/sasu` → button visible (salary + IS + dividends)
- `/holding` → button visible (dual-entity flow, the most complex)
- `/salarie` → button hidden (linear: employer cost → cotis → net)
- `/portage` → button hidden (linear: CA → fee → cotis → net)

**Implementation:**
```tsx
// components/flow/flow-trigger.tsx
import dynamic from 'next/dynamic'
import { useState } from 'react'

const PedagogicalFlow = dynamic(
  () => import('./pedagogical-flow'),
  { ssr: false, loading: () => <FlowSkeleton /> }
)

export function FlowTrigger({ simResult, showFlow }: Props) {
  const [open, setOpen] = useState(false)

  if (!showFlow) return null

  return open ? (
    <PedagogicalFlow simResult={simResult} onClose={() => setOpen(false)} />
  ) : (
    <button onClick={() => setOpen(true)}
      className="w-full border border-dashed border-border rounded-md p-4 text-accent hover:border-accent transition-colors">
      🔍 Comprendre la mécanique
      <span className="text-text-tertiary text-sm block mt-1">
        Voir comment l'argent circule dans la structure
      </span>
    </button>
  )
}
```

**@xyflow bundle:** 0KB initial. +60KB loaded only when user clicks "Comprendre la mécanique". Chunk is cached after first load.

### Decision Impact Summary

| Decision | SEO | UX | Performance | Effort |
|----------|-----|-----|------------|--------|
| Route groups | +320% keyword surface | Dedicated pages per status | Code splitting per route | 8 page files |
| Pills-as-Links | Clean URLs, back button | No morph (compensated by skeleton) | Client navigation (~200ms) | StatusNav component |
| Cascades side-by-side | /comparer dedicated page | Visual comparison, delta metric | Multiple engines computed | ComparisonPage |
| Fade + stagger | — | Premium feel, continuity | CSS only, loading.tsx skeleton | Minimal |
| Contextual flow button | — | Wow factor for complex statuses | 0KB initial, +60KB on demand | FlowTrigger + lazy import |

### Decisions Deferred (Post-MVP)

| Decision | Reason | When to Decide |
|----------|--------|---------------|
| Dagre auto-layout for @xyflow | Fixed positions sufficient for v1. Evaluate after user feedback on flow complexity | After first 100 users interact with flow |
| `output: 'export'` in next.config | Static export not needed yet (Vercel handles SSR fine) | If moving off Vercel |
| i18n routing | MVP is French-only | If international expansion |
| GitHub Issues API integration | Phase 2 feature (/proposer, /propositions) | After MVP validation |

## Implementation Patterns & Consistency Rules

### Naming Patterns

**Files:** `kebab-case` for all files — `cascade-flow.tsx`, `hero-net.tsx`, `engine.test.ts`
**Components:** PascalCase — `CascadeFlow`, `CascadeCard`, `HeroNet`
**Props:** `{ComponentName}Props` — `CascadeFlowProps`
**Functions:** camelCase — `simMicro`, `calcIR`, `fmt`
**Hooks:** `use` prefix — `useSimulationParams`, `useAnimatedNumber`
**CSS:** Tailwind utilities only. CSS variables for tokens (`globals.css @theme`). No CSS modules. `style={}` only for dynamic values (bar width, transition delay).

### Component Patterns

**Structure order:** `"use client"` → imports (external → internal → types) → props type → named export function (hooks → derived state → handlers → JSX).

**Exports:** Named exports for all components. No default exports except `page.tsx` and `layout.tsx` (Next.js requirement). Barrel exports per feature directory.

**One component per file.** No inline sub-components (this is the anti-pattern being fixed from the current monolith).

### Engine Patterns

**Signatures:** Every sim function takes `(ca, parts, ...regime-specific)` and returns its discriminated union variant with `kind` field.

**Union narrowing (mandatory):**
```tsx
// ✅ Always narrow via kind
switch (sim.kind) {
  case 'sasu_b': return sim.profit
}
// ❌ Never cast: (sim as any).profit
```

**Fiscal constants:** Always import from `@/lib/fiscal`. Never hardcode. Annual update = edit `fiscal.ts` only.

### Test Patterns

**Location:** Co-located — `engine.test.ts` next to `engine.ts`.

**Structure:** Contract tests (shape) → golden dataset value tests (±1€) → boundary tests (CA=0, thresholds).

**Golden dataset:** JSON file with ~20-30 verified cases, each with `name`, `kind`, `input`, `expected`, `source` (URSSAF/DGFiP reference).

### URL State Patterns

Each route defines its own nuqs params with `parseAs*` and `withDefault`. camelCase param names. Never use raw `useSearchParams()`.

### Error Handling

Engine functions are pure — cannot fail with valid inputs. Input clamped at component level (`Math.max(0, Math.min(ca, 500000))`). React error boundary at route group level. No loading states for computation (<1ms) — only for page navigation skeleton and @xyflow lazy load.

### Animation Patterns

| Type | Tool |
|------|------|
| Number counting | anime.js (`useAnimatedNumber`) |
| Bar resize | CSS `transition: width 500ms` |
| Card stagger | CSS `transitionDelay: index * 80ms` |
| Card expand/collapse | CSS `max-height` + `overflow: hidden` |
| Opacity/fade | CSS `transition: opacity 200ms` |
| @xyflow nodes | @xyflow built-in + custom CSS |

No Framer Motion, no GSAP. CSS transitions + anime.js cover all needs.

### Enforcement (AI Agents MUST)

1. Run `npm run test:unit` before claiming a story complete
2. Follow discriminated union narrowing (no `as any`)
3. Use named exports (no default except Next.js pages)
4. Co-locate tests with source
5. Import constants from `@/lib/fiscal` — never hardcode
6. Tailwind for all styling
7. Format amounts with `fmt()` from `@/lib/utils`

## Project Structure & Boundaries

### Complete Directory Structure

```
simulateur-freelance/
├── .github/workflows/ci.yml          # Tests + coverage + build + a11y
├── app/
│   ├── layout.tsx                     # Root: fonts, NuqsAdapter, footer
│   ├── page.tsx                       # Landing "Qui êtes-vous ?"
│   ├── globals.css                    # Tailwind v4 @theme tokens
│   ├── not-found.tsx                  # 404
│   ├── error.tsx                      # Root error boundary
│   ├── (freelance)/                   # Route group (NOT in URL)
│   │   ├── layout.tsx                 # Header + StatusNav + Sidebar freelance
│   │   ├── loading.tsx                # Skeleton cascade
│   │   ├── error.tsx                  # Error boundary freelance
│   │   ├── micro/page.tsx             # → /micro
│   │   ├── ei/page.tsx                # → /ei
│   │   ├── eurl/page.tsx              # → /eurl
│   │   ├── sasu/page.tsx              # → /sasu
│   │   ├── holding/page.tsx           # → /holding
│   │   └── comparer/page.tsx          # → /comparer
│   └── (salarie)/                     # Route group (NOT in URL)
│       ├── layout.tsx                 # Header + controls salarié
│       ├── loading.tsx                # Skeleton cascade
│       ├── salarie/page.tsx           # → /salarie
│       └── portage/page.tsx           # → /portage
├── components/
│   ├── cascade/                       # Hero visualization
│   │   ├── index.ts                   # Barrel exports
│   │   ├── cascade-flow.tsx           # Orchestrator
│   │   ├── cascade-card.tsx           # Individual step card
│   │   └── cascade-detail.tsx         # Tap-to-reveal panel
│   ├── comparison/                    # Comparison features
│   │   ├── index.ts
│   │   ├── comparison-mini.tsx        # Compact grid all statuses
│   │   ├── comparison-page.tsx        # /comparer multi-cascade
│   │   └── delta-metric.tsx           # ±X€ vs previous
│   ├── controls/                      # User inputs
│   │   ├── index.ts
│   │   ├── sidebar.tsx                # Desktop sidebar
│   │   ├── mobile-top-bar.tsx         # Mobile collapsed controls
│   │   └── status-nav.tsx             # Pills-as-Links
│   ├── flow/                          # Pedagogical @xyflow (lazy)
│   │   ├── index.ts
│   │   ├── flow-trigger.tsx           # "Comprendre la mécanique" button
│   │   ├── pedagogical-flow.tsx       # @xyflow wrapper
│   │   ├── flow-node.tsx              # Custom node renderer
│   │   ├── flow-edge.tsx              # Custom edge renderer
│   │   └── flow-config.ts             # Fixed positions per variant
│   ├── hero/
│   │   ├── index.ts
│   │   └── hero-net.tsx               # Large NET amount display
│   ├── landing/
│   │   ├── index.ts
│   │   └── profile-cards.tsx          # Identity routing cards
│   ├── layout/
│   │   ├── header.tsx
│   │   └── footer.tsx
│   └── ui/                            # shadcn/ui (curated)
│       ├── currency-input.tsx
│       ├── range-slider.tsx
│       └── chart.tsx
├── hooks/
│   ├── use-animated-number.ts         # anime.js number counter
│   └── use-simulation-params.ts       # Per-route nuqs params
├── lib/
│   ├── engine.ts                      # Pure fiscal engine
│   ├── engine.test.ts                 # Unit tests
│   ├── fiscal.ts                      # Constants 2026
│   ├── fiscal.test.ts                 # Constants verification
│   ├── types.ts                       # Discriminated union Sim
│   ├── utils.ts                       # cn(), fmt()
│   ├── colors.ts                      # Design tokens for JS
│   └── fixtures/
│       └── golden-dataset.json        # Verified reference data
├── public/og/                         # Per-status OG images
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.js
├── vitest.config.ts
└── CLAUDE.md
```

### Architectural Boundaries

**Computation (lib/):** Pure domain logic. Zero React imports. Testable independently. `engine.ts` + `fiscal.ts` + `types.ts`.

**Visualization (components/):** Renders `Sim` data. Never calls engine directly. Cascade = CSS-only. Flow = @xyflow lazy-loaded.

**State (nuqs per route):** Each route owns its params. No shared state between routes. URL = single source of truth.

**Layout (route groups):** `(freelance)` layout = StatusNav + freelance sidebar. `(salarie)` layout = salarié controls. Root layout = fonts + NuqsAdapter.

### Data Flow

```
User Input (nuqs URL params)
  → Route page.tsx (Server Component, Suspense)
    → Client Simulator ("use client")
      → useQueryStates() for local params
      → engine functions (pure, <1ms)
        → reads fiscal.ts constants
        → returns Sim variant (discriminated union)
      → CascadeFlow renders cards
        → CascadeCard: icon + label + amount + bar
          → tap → CascadeDetail expands
      → URL updates silently (nuqs)
```

### FR to Structure Mapping

| FR Group | Directory | Key Files |
|----------|-----------|-----------|
| FR1-10 (Engine) | lib/ | engine.ts, fiscal.ts, types.ts |
| FR11-15 (Visual) | components/cascade/, hero/ | cascade-flow.tsx, hero-net.tsx |
| FR16-18 (Navigation) | app/, components/controls/ | page.tsx per route, status-nav.tsx |
| FR19-21 (Sharing) | hooks/ | use-simulation-params.ts |
| FR22-25 (Education) | components/cascade/, flow/ | cascade-detail.tsx, pedagogical-flow.tsx |
| FR26-30 (Accessibility) | All components | ARIA patterns, sr-only tables |
| FR31-33 (SEO) | app/*/page.tsx | Per-route metadata |
| FR34-36 (Admin) | lib/fiscal.ts | Single constants file |
| FR39-45 (UX) | components/cascade/, hooks/ | Animations, input clamping |

## Architecture Validation

### Coherence ✅

All decisions are compatible and non-contradictory:
- Next.js 16 route groups + nuqs per-route params + Pills-as-Links = consistent navigation model
- CSS cascade + @xyflow lazy = zero conflict (different components, different loading)
- Discriminated union + per-route params = type-safe state per route
- Feature-based directories + barrel exports = clean import boundaries
- No Zustand, no Context — nuqs URL state is the ONLY state management (URL = shareable state)

### Requirements Coverage ✅

All 45 FRs mapped to specific directories and files. All 26 NFRs architecturally supported. No uncovered requirement.

### Implementation Readiness ✅

Decisions documented with code examples. Patterns enforceable. Structure complete. Boundaries defined.

### Gaps Addressed

| Gap | Resolution |
|-----|-----------|
| `fmt()` in engine.ts | Move to `lib/utils.ts` in Phase 1 cleanup |
| `lib/colors.ts` missing | Create in Phase 1 with CSS var exports for chart libraries |
| Golden dataset not built | **Blocker for Phase 0** — build 20 cases before any refactoring |
| 301 redirects old URLs | Add to `next.config.ts` redirects array (see below) |

**301 Redirect specification:**
```ts
// next.config.ts
const nextConfig = {
  redirects: async () => [
    // Old single-page URLs → new route-per-status
    { source: '/', destination: '/micro', permanent: true,
      has: [{ type: 'query', key: 'statut', value: 'micro' }] },
    { source: '/', destination: '/ei', permanent: true,
      has: [{ type: 'query', key: 'statut', value: 'ei' }] },
    { source: '/', destination: '/eurl', permanent: true,
      has: [{ type: 'query', key: 'statut', value: 'eurl' }] },
    { source: '/', destination: '/sasu', permanent: true,
      has: [{ type: 'query', key: 'statut', value: 'sasu' }] },
    { source: '/', destination: '/holding', permanent: true,
      has: [{ type: 'query', key: 'statut', value: 'holding' }] },
    // Default: old / with ca param but no statut → /micro (most common)
    { source: '/', destination: '/micro', permanent: false,
      has: [{ type: 'query', key: 'ca' }],
      missing: [{ type: 'query', key: 'statut' }] },
  ],
}
```

### Completeness Checklist

- [x] Project context analyzed
- [x] Stack formalized (keep/remove/add)
- [x] Core decisions made (routing, navigation, comparison, transitions, flow trigger)
- [x] Implementation patterns defined (naming, components, engine, tests, URL, errors, animation)
- [x] Project structure complete (directory tree, boundaries, data flow, FR mapping)
- [x] Validation passed (coherence, coverage, readiness)
- [x] Gaps identified and resolved
- [x] 301 redirects specified

### Readiness Assessment

**Status: READY FOR IMPLEMENTATION**
**Confidence: 8/10**

**Migration Order (strict):**

| Phase | Action | Prerequisite | Can Parallelize? |
|-------|--------|-------------|-----------------|
| 0a | Install Vitest, create vitest.config.ts | None | Yes with 0b |
| 0b | Build golden dataset (20 cases, manual URSSAF/DGFiP verification) | None | Yes with 0a |
| 0c | Write engine tests (contract + golden + boundary), CI gate | 0a + 0b | No |
| 1 | Delete dead code (sankey, dead shadcn, structure-card), remove packages | 0c (tests green) | No |
| 2 | Discriminated union: add `kind` field, refactor types.ts, update engine returns | 1 (clean codebase) | No |
| 3 | Extract components from monolith (cascade, hero, controls, comparison) | 2 (types stable) | No |
| 4 | MPA routes: create route groups, per-status pages, StatusNav as Links, 301 redirects | 3 (components stable) | No |
| 5 | Pedagogical @xyflow: rebuild flow with "wow" animations, lazy-loaded | 4 (routing working) | No |
| 6 | New simulators: CDI (salarie), portage salarial engines + routes | 4 (routing working) | Yes with 5 |

**First Day Checklist:**
1. `npm install -D vitest @vitest/coverage-v8` 
2. Create `vitest.config.ts` (environment: node, coverage on lib/, alias @/)
3. Create `lib/engine.test.ts` — contract tests for simMicro, calcIR, calcIS (shape only, not values yet)
4. Start building golden dataset: run current app, screenshot 5 scenarios, verify against URSSAF
5. `npm run test` passes → commit "chore: add vitest + first engine contract tests"
