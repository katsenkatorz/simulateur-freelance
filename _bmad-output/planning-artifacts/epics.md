---
stepsCompleted: [1, 2, 3, 4]
status: complete
completedAt: '2026-04-14'
inputDocuments:
  - '_bmad-output/planning-artifacts/prd.md'
  - '_bmad-output/planning-artifacts/architecture-v2.md'
  - '_bmad-output/planning-artifacts/ux-design-specification.md'
---

# Simulateur de Rémunération - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for the Simulateur de Rémunération, decomposing the requirements from the PRD, UX Design, and Architecture v2 into implementable stories.

## Requirements Inventory

### Functional Requirements

- FR1: User can compute a freelance fiscal simulation for 5 legal structures (Micro BNC, EI, EURL, SASU, SASU+Holding)
- FR2: User can compute a CDI employee simulation showing employer cost, gross salary, social contributions, income tax, and net salary
- FR3: User can compute a portage salarial simulation showing CA, management fees, social contributions, income tax, and net salary
- FR4: User can adjust management fee percentage for portage salarial
- FR5: User can toggle between Mode A (full salary) and Mode B (capitalization via IS) for applicable structures
- FR6: User can adjust fiscal household shares (1 to 3 parts)
- FR7: User can toggle between standard IS threshold (42,500€) and PLF 2026 extended threshold (100,000€)
- FR8: User can select tax regime (IR or IS) independently per structure (EI, EURL, SASU)
- FR9: User can adjust manager salary and mandate remuneration for capitalization and holding modes
- FR10: System computes all simulations using official, up-to-date French tax brackets and social contribution rates
- FR11: User can view a visual flow diagram showing the complete path of money from total cost to net pocket
- FR12: User can view human-readable labels on each flow node explaining what each contribution buys
- FR13: User can drill down from macro visualization to detailed breakdown of each category
- FR14: User can view a comparison table of all available structures within a simulator type
- FR15: User can view a proportional bar showing breakdown of charges, taxes, and net as percentage of total
- FR16: User can select their profile type from a landing page ("Employee", "Freelance/Independent", "I want to compare")
- FR17: User can navigate between simulator types without losing input parameters
- FR18: User can access each simulator via a dedicated URL route
- FR19: User can share a URL that reproduces their exact simulation scenario
- FR20: User can bookmark a simulation and return to the exact same state
- FR21: System preserves all user parameters in the URL without server-side storage
- FR22: User can view a contextual explanation of what each social contribution funds
- FR23: User can view retirement pension estimate and validated quarters
- FR24: User can view a detailed line-by-line calculation breakdown
- FR25: User can view capital usage guidance in capitalization mode
- FR26: User can operate all simulator controls via keyboard
- FR27: User can access a text-based alternative for all visual diagrams
- FR28: User can use full simulator functionality on mobile (375px+)
- FR29: User can zoom to 200% without loss of functionality
- FR30: System meets RGAA 4.1 conformance requirements
- FR31: Search engines can crawl and index each simulator as a standalone page with unique metadata
- FR32: Each simulator page includes structured data for enhanced search results
- FR33: System generates indexable pages that search engines can crawl without requiring JavaScript execution
- FR34: Administrator can update fiscal constants by editing a single configuration file
- FR35: Administrator can add a new simulator type via central configuration without modifying existing simulators
- FR36: System displays an educational-purpose disclaimer
- FR37: System tracks page views, visitors, session duration, and traffic sources without cookies
- FR38: System monitors Core Web Vitals in production via real user metrics
- FR39: User receives an instant first result with maximum 2 inputs — progressive disclosure for advanced parameters
- FR40: System validates and constrains user inputs with clear feedback
- FR41: System computes correct results at all IR/IS bracket boundaries (e.g., CA at micro BNC cap, income at IR bracket transitions) with no rounding error exceeding ±1€
- FR42: System maintains calculation invariant: total charges + net = gross input
- FR43: User can view contextual micro-explanations for fiscal terms without leaving the current view
- FR44: System provides an alternative visualization layout when viewport width is below 640px
- FR45: System preserves backward compatibility of shared URLs across fiscal year updates

### NonFunctional Requirements

- NFR1: First result render <100ms (pure functions)
- NFR2: LCP <2.5s on 4G
- NFR3: INP <200ms
- NFR4: Time to Interactive <3s on 4G
- NFR5: CLS <0.1
- NFR6: Initial bundle <200KB gzipped (target ~160KB after cleanup)
- NFR7: Lighthouse Performance >90
- NFR8: RGAA automated checks: 0 automated accessibility violations per deployment
- NFR9: RGAA manual audit: annual conformance audit
- NFR10: Lighthouse Accessibility >95
- NFR11: Color contrast text ≥4.5:1, UI ≥3:1
- NFR12: Keyboard operability 100% of controls
- NFR13: Screen reader: all content via ARIA, sr-only table alternatives for charts
- NFR14: Zoom functional at 200%
- NFR15: Calculation accuracy 100% vs official brackets
- NFR16: Calculation precision ±1€ tolerance
- NFR17: Golden dataset verified against URSSAF/DGFiP references
- NFR18: Fiscal freshness: updated within 30 days of publication
- NFR19: URL backward compat: shared URLs valid across fiscal years
- NFR20: Visualization failure fallback: numeric results table if chart libraries fail
- NFR21: Sitemap auto-generated, canonical URLs, ≤2 click depth, structured data
- NFR22: Edge-distributed hosting: unlimited concurrent users via CDN
- NFR23: Incremental loading: adding a simulator does not increase initial page load time
- NFR24: Personal data: zero storage, no cookies, no localStorage
- NFR25: Analytics: cookie-free (privacy-first analytics)
- NFR26: Third-party requests: only analytics provider + GitHub API

### Additional Requirements (Architecture v2)

- AR1: Replace `Sim = any` with discriminated union type (`kind` field) across entire codebase
- AR2: Split monolithic `simulateur/index.tsx` (462 lines) into feature-based component directories
- AR3: Create route-per-status MPA: /micro, /ei, /eurl, /sasu, /holding, /salarie, /portage, /comparer
- AR4: Implement Next.js route groups: (freelance) and (salarie) with shared layouts
- AR5: StatusPills as `<Link>` components (Pills-as-Links) with skeleton transition
- AR6: Delete dead code: lib/sankey.ts, sankey-overview.tsx, structure-card.tsx, 7 dead shadcn components
- AR7: Remove packages: @nivo/sankey, @base-ui/react, class-variance-authority
- AR8: Move fmt() from engine.ts to lib/utils.ts
- AR9: Create lib/colors.ts for JS-accessible design tokens
- AR10: Add Vitest + golden dataset (20-30 verified cases) + CI gate
- AR11: 301 redirects from old URLs (/?statut=X) to new routes (/X)
- AR12: Implement fade + stagger cascade transitions between pages
- AR13: Lazy-load @xyflow via next/dynamic (pedagogical flow, +60KB on demand only)

### UX Design Requirements

- UX-DR1: Build CascadeFlow component — vertical card cascade showing CA → deductions → NET with stagger animation (80ms/card, <600ms total)
- UX-DR2: Build CascadeCard component — individual step with icon + label + amount (JetBrains Mono) + proportional bar + tap-to-reveal detail. WCAG 1.4.1: icon + text label + color (never color alone)
- UX-DR3: Build CascadeDetail component — expandable panel with detail grid (label + amount + human description). aria-live="polite", aria-atomic="false"
- UX-DR4: Build HeroNet component — large NET amount (32px/24px) with percentage, source attribution, aria-live="polite"
- UX-DR5: Build StatusNav component — horizontal pills as `<Link>`, role="radiogroup", status color tint when active
- UX-DR6: Build DeltaMetric component — "±8,400€ vs Micro" after switch, directional color, aria-live="assertive"
- UX-DR7: Build LandingProfileCards — "Who are you?" identity routing (Employee/Freelance/Compare)
- UX-DR8: Build ComparisonPage — side-by-side cascades (desktop 2-3 columns, mobile tabs with swipe)
- UX-DR9: Build FlowTrigger — contextual "Comprendre la mécanique" button, visible only for complex statuses
- UX-DR10: Rebuild pedagogical @xyflow flow with animated schema: central capital node, radiating branches, animated particles, distinctive node shapes. Fixed positions. "Wow" factor
- UX-DR11: Cascade card DOM: `<ul>` → `<li role="presentation">` → `<div role="button" aria-expanded aria-controls>`. Stable IDs
- UX-DR12: Slider accessibility: `<label>`, aria-valuemin/max/now, aria-valuetext, aria-describedby for help text
- UX-DR13: Screen reader NET announcement: aria-live="assertive" sr-only div for NET amount on parameter change
- UX-DR14: sr-only table alternatives for all Recharts visualizations (ComparisonMini, RepartitionBar, TreemapDetail)
- UX-DR15: Cascade card visual enhancement: border-left 2px accent, semantic tint gradient (8% opacity), border #363636
- UX-DR16: Refactor ComparisonMini to use new design tokens and DeltaMetric integration
- UX-DR17: Mobile bottom sheet for complex detail views (slide-up, drag handle, swipe dismiss)
- UX-DR18: prefers-reduced-motion: disable all animations, show all cards instantly
- UX-DR19: Skip-to-content link on every page
- UX-DR20: Sidebar toggle on mobile via useState (hidden lg:flex), hamburger button

### FR Coverage Map

| FR | Epic | Description |
|----|------|-------------|
| FR1 | Epic 4 | Freelance 5 structures via cascade |
| FR2 | Epic 9 | CDI employee simulation |
| FR3, FR4 | Epic 10 | Portage salarial + fee adjustment |
| FR5-9 | Epic 4 | Mode A/B, parts, IS threshold, regime, salary/mandate controls |
| FR10 | Epic 1 | Official brackets computation (verified by golden dataset) |
| FR11-13, FR15 | Epic 3 | Cascade flow, labels, drill-down, proportional bar |
| FR14 | Epic 7 | Comparison side-by-side |
| FR16-18 | Epic 5 | Profile routing, navigation, dedicated URLs |
| FR19-21 | Epic 5 | URL sharing, bookmark, URL state |
| FR22-25 | Epic 4 | Education labels, retirement, line-by-line, capital guidance |
| FR26-30 | Epic 6 | Keyboard, text alternative, mobile, zoom, RGAA |
| FR31-33 | Epic 5 | SEO crawling, structured data, indexable pages |
| FR34 | Epic 1 | Single config file for constants |
| FR36 | Epic 5 | Educational disclaimer |
| FR37-38 | Epic 11 | Analytics, Core Web Vitals |
| FR39-43 | Epic 3 | Instant result, validation, boundaries, invariant, micro-explanations |
| FR44 | Epic 5 | Alternative layout <640px |
| FR45 | Epic 5 | URL backward compat |

## Epic List

### Epic 1: Tests & Type Safety
The fiscal engine is verified against official brackets and types are secured with discriminated union.
**FRs:** FR10, FR34, FR41, FR42
**ARs:** AR1, AR10

### Epic 2: Cleanup & Design Tokens
Codebase cleaned: dead dependencies removed, design tokens centralized.
**ARs:** AR6, AR7, AR8, AR9

### Epic 3: Cascade Flow — Components
The cascade vertical cards are built and tested in isolation: CascadeFlow, CascadeCard, CascadeDetail, HeroNet.
**FRs:** FR11-13, FR15, FR39-43
**UX-DRs:** UX-DR1-4, UX-DR15, UX-DR18

### Epic 4: Cascade Freelance — Integration
Freelance users see the complete journey of every euro via the cascade with all controls.
**FRs:** FR1, FR5-9, FR22-25
**NFRs:** NFR1-7, NFR20
**ARs:** AR2, AR12

### Epic 5: Multi-Status Navigation & SEO
Each status has its own page with dedicated URL, meta tags, and SEO. Users navigate via pills-links.
**FRs:** FR16-21, FR31-33, FR36, FR44, FR45
**NFRs:** NFR19, NFR21-23
**UX-DRs:** UX-DR5, UX-DR7, UX-DR20
**ARs:** AR3, AR4, AR5, AR11

### Epic 6: Accessibility RGAA 4.1
All users — keyboard, screen reader, color blind, 200% zoom — can use the simulator without barriers.
**FRs:** FR26-30
**NFRs:** NFR8-14
**UX-DRs:** UX-DR11-14, UX-DR19

### Epic 7: Comparison Mode
Users compare 2-3 statuses side-by-side with parallel cascades and delta metric.
**FRs:** FR14
**UX-DRs:** UX-DR6, UX-DR8, UX-DR16, UX-DR17

### Epic 8: Pedagogical Flow — The "Wow"
Users explore an animated interactive schema showing how money flows through complex structures.
**FRs:** FR11 (extended), FR22 (extended)
**UX-DRs:** UX-DR9, UX-DR10
**ARs:** AR13

### Epic 9: CDI Employee Simulator
CDI employees see their total employer cost, social contributions, income tax, and net salary.
**FRs:** FR2, FR23

### Epic 10: Portage Salarial Simulator
Portage workers see their CA, management fees, contributions, tax, and net.
**FRs:** FR3, FR4

### Epic 11: Analytics & Monitoring
The product measures usage and performance without cookies or trackers.
**FRs:** FR37, FR38
**NFRs:** NFR24-26

---

## Epic 1: Tests & Type Safety

The fiscal engine is verified against official French tax brackets and social contribution rates. The `Sim = any` escape hatch is replaced with a discriminated union.

### Story 1.1: Vitest Setup & First Engine Contract Tests

As a developer,
I want a test framework configured with contract tests for the fiscal engine,
So that I have a safety net before any refactoring begins.

**Acceptance Criteria:**

**Given** the project has no test framework installed
**When** I run `npm run test`
**Then** Vitest executes and passes with environment 'node'
**And** `vitest.config.ts` resolves `@/` alias and targets `lib/` for coverage
**And** contract tests verify that `simMicro`, `calcIR`, `calcIS` return objects with expected shape
**And** coverage reporting is enabled on `lib/engine.ts` and `lib/fiscal.ts`

### Story 1.2: Golden Dataset & Value Tests

As a developer,
I want a verified golden dataset of fiscal calculations,
So that the engine's accuracy is proven against official URSSAF/DGFiP references.

**Acceptance Criteria:**

**Given** Vitest is configured (Story 1.1)
**When** I run the golden dataset tests
**Then** at least 20 cases execute: 5 statuses × 4 CA scenarios (0€, 50k€, 120k€, 250k€) with parts (1, 2, 2.5)
**And** each case has a `source` field referencing the official document
**And** all net amounts match expected values within ±1€
**And** `lib/fixtures/golden-dataset.json` is committed
**And** boundary tests exist for: CA=0, micro BNC cap, IR bracket transitions, IS thresholds (42,500€ and 100,000€)

### Story 1.3: CI Gate

As a developer,
I want a CI pipeline that blocks merges if tests fail,
So that no regression reaches the release branch.

**Acceptance Criteria:**

**Given** engine tests exist (Stories 1.1-1.2)
**When** a PR is opened
**Then** GitHub Actions runs `npm run test:unit` and blocks on failure
**And** coverage target: 100% branches on `lib/engine.ts`
**And** `npm run build` succeeds
**And** `.github/workflows/ci.yml` is committed

### Story 1.4: Discriminated Union — Replace Sim = any

As a developer,
I want `Sim = any` replaced with a discriminated union,
So that all simulation result access is type-safe.

**Acceptance Criteria:**

**Given** all engine tests pass (Stories 1.1-1.3)
**When** I modify `lib/types.ts`
**Then** `Sim` is a union of `SimMicro | SimTNS_A | SimTNS_B | SimSASU_A | SimSASU_B | SimHolding` with `kind` discriminant
**And** all engine functions return their specific variant
**And** all consumers narrow via `sim.kind` — zero `as any` casts remain
**And** TypeScript compiles with zero errors
**And** all engine tests still pass

---

## Epic 2: Cleanup & Design Tokens

Dead code and unused dependencies are removed. Design tokens are centralized for JS consumption.

### Story 2.1: Delete Dead Code & Remove Packages

As a developer,
I want dead code and unused packages removed,
So that the bundle is lighter and the codebase is clear.

**Acceptance Criteria:**

**Given** the discriminated union is in place (Story 1.4)
**When** I delete dead files and remove packages
**Then** these files are deleted: `lib/sankey.ts`, `components/comparison/sankey-overview.tsx`, `components/comparison/structure-card.tsx`, `hooks/use-animated-number.ts`
**And** these shadcn files are deleted: `components/ui/badge.tsx`, `button.tsx`, `card.tsx`, `tabs.tsx`, `slider.tsx`, `separator.tsx`, `tooltip.tsx`
**And** packages removed: `@nivo/sankey`, `@base-ui/react`, `class-variance-authority`
**And** all imports in `simulateur/index.tsx` are updated (no broken references)
**And** `npm run build` succeeds
**And** all tests pass

### Story 2.2: Move fmt() & Create Design Tokens

As a developer,
I want `fmt()` moved to utils and design tokens accessible in JS,
So that formatting and colors are properly separated from the engine.

**Acceptance Criteria:**

**Given** dead code is removed (Story 2.1)
**When** I refactor utilities
**Then** `fmt()` and `isLabel()` are moved from `lib/engine.ts` to `lib/utils.ts`
**And** all imports across the codebase are updated
**And** `lib/colors.ts` exports all CSS variable values as JS constants (status colors, semantic colors)
**And** `npm run build` succeeds and all tests pass

---

## Epic 3: Cascade Flow — Components

The cascade vertical card components are built and tested in isolation, independent of any specific simulator.

### Story 3.1: CascadeCard Component

As a user,
I want to see a single deduction step as a card with icon, label, amount, and proportional bar,
So that I understand each part of the fiscal breakdown at a glance.

**Acceptance Criteria:**

**Given** a CascadeCard receives item data (type, icon, label, amount, percentage)
**When** the component renders
**Then** it displays: distinctive icon + plain French label + amount in JetBrains Mono + percentage
**And** a proportional colored bar fills to the correct width (charges=red, tax=orange, net=green)
**And** border-left is 2px accent color, background has 8% semantic tint gradient
**And** card border is `#363636`
**And** the component is a named export from `components/cascade/index.ts`

### Story 3.2: CascadeDetail — Tap-to-Reveal Panel

As a user,
I want to tap a cascade card to see a detailed breakdown,
So that I understand what each deduction funds (retirement, healthcare, etc.).

**Acceptance Criteria:**

**Given** a CascadeCard is rendered
**When** I tap/click the card
**Then** a detail panel slides down (300ms animation) showing a grid of detail rows
**And** each row has: label + amount + human-readable description
**And** the rest of the cascade dims to 40% opacity
**And** tapping the same card collapses the detail
**And** tapping a different card collapses the current and opens the new one (accordion)
**And** keyboard: Enter/Space toggles, Escape collapses

### Story 3.3: CascadeFlow — Orchestrator with Stagger Animation

As a user,
I want to see the complete cascade from CA to NET with a stagger animation,
So that the money flow unfolds progressively and feels like a revelation.

**Acceptance Criteria:**

**Given** CascadeFlow receives a SimResult
**When** the component mounts or simResult changes
**Then** cascade cards appear sequentially with 80ms stagger delay each
**And** total animation completes in <600ms
**And** animation uses `cubic-bezier(0.25, 0.46, 0.45, 0.94)` easing
**And** on parameter change: bars resize and numbers animate (useAnimatedNumber, 800ms)
**And** `prefers-reduced-motion`: all cards appear instantly, no animation

### Story 3.4: HeroNet — Primary Result Display

As a user,
I want to see my NET amount prominently displayed,
So that I immediately know how much I keep.

**Acceptance Criteria:**

**Given** a simulation is computed
**When** the cascade renders
**Then** HeroNet shows NET amount in JetBrains Mono Bold 32px (desktop) / 24px (mobile) in green
**And** percentage of CA is displayed below
**And** source attribution "Barème officiel 2026" is visible
**And** number animates on parameter change (800ms)
**And** `aria-live="polite"` announces NET changes to screen readers

### Story 3.5: Mobile Cascade Layout

As a mobile user,
I want the cascade fully functional on my phone,
So that I can explore fiscal breakdowns anywhere.

**Acceptance Criteria:**

**Given** viewport width is 375px
**When** the cascade renders
**Then** all cards are full width with 20px padding
**And** amounts are readable (15px JetBrains Mono)
**And** no horizontal scroll occurs
**And** tap-to-reveal works with touch
**And** gap between cards is 12px
**And** HeroNet amount is 24px

---

## Epic 4: Cascade Freelance — Integration

The cascade is connected to the freelance fiscal engine with all controls, delivering the core user experience.

### Story 4.1: Cascade Connected to Freelance Engine

As a freelance user,
I want the cascade to show my fiscal breakdown for the selected status,
So that I see where every euro of my CA goes.

**Acceptance Criteria:**

**Given** I am on the freelance simulator page
**When** I enter a CA (default 80,000€)
**Then** the cascade shows the correct breakdown for the selected status (default: Micro)
**And** the computation uses `lib/engine.ts` functions
**And** the invariant "Charges + Impôts + Net = CA ✓" is displayed and correct
**And** the cascade updates in <100ms when CA changes

### Story 4.2: Sidebar Controls — CA, Parts, Mode, Regime

As a freelance user,
I want controls to adjust CA, fiscal shares, mode A/B, and tax regime,
So that I can explore different scenarios.

**Acceptance Criteria:**

**Given** the cascade is connected (Story 4.1)
**When** I adjust CA via slider or input
**Then** the cascade updates immediately (numbers animate, bars resize)
**When** I change fiscal shares (1 to 3)
**Then** IR recalculates and cascade updates
**When** I toggle Mode A/B (for applicable statuses)
**Then** cascade cards change (IS card appears in Mode B, capital card added)
**When** I toggle IR/IS regime
**Then** computation switches and cascade updates
**And** all parameters are persisted in the URL via nuqs

### Story 4.3: IS Threshold Toggle & Educational Labels

As a freelance user,
I want to toggle between standard and extended IS thresholds and see what each contribution funds,
So that I understand PLF 2026 impact and what my money buys.

**Acceptance Criteria:**

**Given** the cascade is rendering with IS-applicable status
**When** I toggle IS seuil (42,500€ ↔ 100,000€)
**Then** the IS calculation updates and cascade reflects the change
**And** each cascade card detail shows human-readable labels: "What you pay for retirement", "Healthcare coverage at 70%", etc.
**And** retirement estimate (validated quarters) is visible in the detail panel
**And** capital usage guidance appears in Mode B detail

### Story 4.4: Comparison Mini Grid

As a freelance user,
I want to see all 5 statuses compared at a glance below the cascade,
So that I can quickly identify which status keeps more net.

**Acceptance Criteria:**

**Given** the cascade shows one status
**When** I scroll below the cascade
**Then** a compact grid shows all 5 statuses with: name, NET amount, proportional bar in status color
**And** the current status is highlighted
**And** tapping a status in the grid navigates to that status page (Pills-as-Links pattern)

---

## Epic 5: Multi-Status Navigation & SEO

Each status has its own route with dedicated SEO. Users navigate via pill links.

### Story 5.1: Route Groups & Page Structure

As a developer,
I want route groups (freelance) and (salarie) with shared layouts,
So that each status has its own page with SEO while sharing common UI.

**Acceptance Criteria:**

**Given** the current single-page app
**When** I create the route structure
**Then** `app/(freelance)/layout.tsx` provides shared header + StatusNav + sidebar
**And** `app/(freelance)/micro/page.tsx` through `holding/page.tsx` each render their simulator
**And** `app/(salarie)/layout.tsx` provides salarié-specific layout
**And** `app/(salarie)/salarie/page.tsx` and `portage/page.tsx` exist
**And** each `page.tsx` is a Server Component wrapping `<Suspense>` around the client simulator
**And** `loading.tsx` in each group shows a skeleton cascade

### Story 5.2: StatusNav — Pills as Links

As a user,
I want to switch between statuses by tapping pills that navigate to dedicated pages,
So that each status has a clean URL and I can use browser back/forward.

**Acceptance Criteria:**

**Given** I am on `/micro`
**When** I tap the "SASU" pill
**Then** the browser navigates to `/sasu` (Next.js client navigation)
**And** the URL updates in the address bar
**And** common params (ca, parts) are carried via the link href
**And** the cascade shows a skeleton briefly, then staggers in with SASU data
**And** StatusNav highlights the active pill with status color tint
**And** `role="radiogroup"` with `aria-current="page"` on active pill

### Story 5.3: Landing Page — Identity Routing

As a new user,
I want a landing page that asks "Who are you?" and routes me to the right simulator,
So that I don't face all options at once.

**Acceptance Criteria:**

**Given** I land on `/`
**When** the page loads
**Then** I see 3 profile cards: "Salarié(e)", "Indépendant(e)", "Comparer"
**And** tapping "Salarié(e)" navigates to `/salarie`
**And** tapping "Indépendant(e)" navigates to `/micro` (default freelance)
**And** tapping "Comparer" navigates to `/comparer`
**And** the page has unique metadata: title, description, OG tags

### Story 5.4: Per-Page SEO Metadata & Structured Data

As the product owner,
I want each status page to have unique SEO metadata,
So that Google indexes each simulator independently.

**Acceptance Criteria:**

**Given** each status has its own page
**When** Google crawls the site
**Then** each page has unique `<title>`, `<meta description>`, canonical URL
**And** JSON-LD structured data (WebApplication) is present on each page
**And** FAQPage schema is on `/comparer`
**And** OG tags (title, description, image) are per-page
**And** `sitemap.xml` is auto-generated listing all routes
**And** `robots.txt` points to sitemap

### Story 5.5: 301 Redirects & Backward Compatibility

As an existing user with bookmarked URLs,
I want old URLs to redirect to the new routes,
So that my bookmarks still work.

**Acceptance Criteria:**

**Given** an old URL like `/?statut=sasu&ca=100000&parts=2`
**When** I visit it
**Then** I am 301-redirected to `/sasu?ca=100000&parts=2`
**And** all old `statut` param values are handled (micro, ei, eurl, sasu, holding)
**And** old URLs without `statut` but with `ca` redirect to `/micro` (default)
**And** redirects are defined in `next.config.ts`

### Story 5.6: Mobile Sidebar Toggle & Responsive Layout

As a mobile user,
I want controls collapsed in a top bar with a toggle button,
So that the cascade gets full screen on my phone.

**Acceptance Criteria:**

**Given** viewport width <1024px
**When** the page loads
**Then** sidebar is hidden, a hamburger/toggle button is visible
**When** I tap the toggle
**Then** controls appear (CA slider, parts, mode toggles)
**When** I tap toggle again or outside
**Then** controls collapse
**And** on desktop (≥1024px), sidebar is always visible (no toggle needed)
**And** educational disclaimer is visible on all pages

---

## Epic 6: Accessibility RGAA 4.1

Full RGAA 4.1 compliance across all components.

### Story 6.1: Cascade Card ARIA & Keyboard Navigation

As a keyboard/screen reader user,
I want cascade cards to be fully navigable and announced,
So that I can understand the fiscal breakdown without a mouse.

**Acceptance Criteria:**

**Given** the cascade is rendered
**When** I Tab through cards
**Then** each card receives visible focus (outline 2px accent, offset 2px)
**And** DOM structure: `<ul role="list">` → `<li role="presentation">` → `<div role="button" aria-expanded aria-controls>`
**And** `aria-label` includes full context: "Cotisations sociales: 20 480 euros, 25,6 pourcent du chiffre d'affaires"
**And** Enter/Space toggles expansion, Escape collapses
**And** IDs are deterministic (stable across hydration)

### Story 6.2: Slider & Input Accessibility

As a screen reader user,
I want all inputs properly labeled and announced,
So that I can adjust simulation parameters.

**Acceptance Criteria:**

**Given** the sidebar controls are rendered
**When** I focus the CA slider
**Then** `<label>` is associated, `aria-valuemin/max/now` are set, `aria-valuetext` reads "80 000 euros"
**And** `aria-describedby` links to help text explaining the field
**And** all numeric inputs have visible labels
**And** touch targets are minimum 44×44px

### Story 6.3: Screen Reader Alternatives & NET Announcement

As a screen reader user,
I want chart alternatives and live NET announcements,
So that I receive the same information as sighted users.

**Acceptance Criteria:**

**Given** the cascade and charts are rendered
**When** parameters change
**Then** a sr-only div with `aria-live="assertive"` announces the new NET amount
**And** every Recharts visualization (ComparisonMini, RepartitionBar, TreemapDetail) has a `sr-only` `<table>` alternative
**And** `aria-hidden="true"` is set on SVG chart containers
**And** skip-to-content link is the first focusable element on every page

### Story 6.4: axe-core CI & Contrast Verification

As a developer,
I want automated accessibility checks in CI,
So that no a11y regression ships.

**Acceptance Criteria:**

**Given** the CI pipeline exists (Story 1.3)
**When** CI runs
**Then** axe-core reports 0 violations
**And** Lighthouse Accessibility score >95
**And** color contrast is verified: text-primary/bg-primary ≥19:1, text-secondary ≥7:1
**And** `prefers-reduced-motion` is respected (all animations disabled)

---

## Epic 7: Comparison Mode

Side-by-side comparison with cascades and delta metrics.

### Story 7.1: Comparison Page — Side-by-Side Cascades

As a user choosing between statuses,
I want to see 2-3 cascades side-by-side,
So that I can visually compare where money goes in each structure.

**Acceptance Criteria:**

**Given** I navigate to `/comparer`
**When** the page loads
**Then** I see a shared CA input at top
**And** 2-3 cascade columns rendered (desktop: grid, mobile: tabs with swipe)
**And** each cascade shows the full breakdown for its status
**And** changing CA updates all cascades simultaneously
**And** each column is color-coded by status accent

### Story 7.2: DeltaMetric & ComparisonMini Refactor

As a user,
I want to see the difference between statuses highlighted,
So that I instantly know which keeps more net.

**Acceptance Criteria:**

**Given** I switch status or view comparison
**When** delta is computed
**Then** DeltaMetric shows "+8 400 € vs Micro" (green) or "-3 200 €" (rose)
**And** `aria-live="assertive"` announces the delta
**And** ComparisonMini grid uses new design tokens and integrates DeltaMetric
**And** on mobile, comparison uses tabs with delta visible on each tab

---

## Epic 8: Pedagogical Flow — The "Wow"

Interactive animated schema for complex fiscal structures, lazy-loaded.

### Story 8.1: FlowTrigger — Contextual Button

As a user viewing a complex status,
I want a button to explore how money circulates through the structure,
So that I can understand why SASU+Holding or Mode B is structured differently.

**Acceptance Criteria:**

**Given** I am on a complex status page (SASU, Holding, EURL+IS, EI+IS)
**When** the cascade renders
**Then** a "Comprendre la mécanique" button appears below the cascade
**And** the button is NOT visible on Micro, EI-IR, CDI, or Portage pages
**And** clicking the button lazy-loads the @xyflow component (0KB initial, +60KB on demand)
**And** a loading skeleton shows while the chunk loads

### Story 8.2: Pedagogical Flow — Animated Schema

As a user exploring fiscal structure,
I want a beautiful animated schema showing capital flowing through entities,
So that I have a "wow" moment understanding how the structure works.

**Acceptance Criteria:**

**Given** the FlowTrigger is clicked
**When** the pedagogical flow loads
**Then** @xyflow renders with: central capital node (CA amount, pulsing aura), radiating branches to IS/salary/dividends/holding
**And** distinctive node shapes per type (diamond for holding, circle for remuneration)
**And** edges are curved bézier paths with animated flow direction
**And** amounts are displayed on nodes in JetBrains Mono
**And** sequential reveal animation on load (~3s)
**And** positions are fixed (from flow-config.ts), not auto-layout
**And** clicking a node shows detail
**And** on mobile: simplified vertical flow or scroll-to-explore
**And** the flow syncs with current params (CA change → amounts update)

---

## Epic 9: CDI Employee Simulator

New engine and cascade for CDI employees.

### Story 9.1: CDI Fiscal Engine

As a developer,
I want a CDI simulation engine,
So that employees can compute their fiscal breakdown.

**Acceptance Criteria:**

**Given** the engine architecture (pure functions in `lib/engine.ts`)
**When** `simCDI(brutAnnuel, parts)` is called
**Then** it returns a SimCDI variant with: employer cost, patronal contributions, salarial contributions, gross, IR, net
**And** contributions include: maladie, retraite AGIRC-ARRCO, chômage, allocations familiales, CSG/CRDS
**And** calculations verified against golden dataset (5 CDI cases added)
**And** retirement quarters estimate included
**And** all tests pass

### Story 9.2: CDI Cascade & Page

As a CDI employee,
I want to see my complete fiscal breakdown from employer cost to net salary,
So that I understand what my employer pays and where the difference goes.

**Acceptance Criteria:**

**Given** the CDI engine exists (Story 9.1)
**When** I navigate to `/salarie` and enter my gross salary
**Then** the cascade shows: employer cost → patronal contributions → salarial contributions → IR → NET
**And** each card has human-readable labels ("What your employer pays for your retirement")
**And** the invariant holds: patronal + salarial + IR + NET = employer cost
**And** URL params: `brut` (or `net`) + `parts`
**And** page has unique SEO metadata

---

## Epic 10: Portage Salarial Simulator

New engine and cascade for portage salarial.

### Story 10.1: Portage Fiscal Engine

As a developer,
I want a portage salarial simulation engine,
So that portage workers can compute their fiscal breakdown.

**Acceptance Criteria:**

**Given** the engine architecture
**When** `simPortage(ca, parts, fraisGestion)` is called
**Then** it returns a SimPortage variant with: CA, management fee, contributions, IR, net
**And** management fee is parameterized (default 8%, range 5-15%)
**And** calculations verified against golden dataset (3 portage cases added)
**And** all tests pass

### Story 10.2: Portage Cascade & Page

As a portage salarial worker,
I want to see my breakdown from CA to net after management fees,
So that I understand the cost of portage and what I keep.

**Acceptance Criteria:**

**Given** the portage engine exists (Story 10.1)
**When** I navigate to `/portage` and enter my CA
**Then** the cascade shows: CA → management fee → contributions → IR → NET
**And** a slider adjusts management fee (5-15%) with live cascade update
**And** URL params: `ca`, `parts`, `fraisGestion`
**And** page has unique SEO metadata

---

## Epic 11: Analytics & Monitoring

Cookie-free analytics and performance monitoring.

### Story 11.1: Vercel Analytics & Core Web Vitals

As the product owner,
I want to track usage and performance without cookies,
So that I understand how the product is used while respecting privacy.

**Acceptance Criteria:**

**Given** the app is deployed on Vercel
**When** a user visits any page
**Then** Vercel Analytics tracks page views, visitors, session duration, and traffic sources
**And** no cookies are set, no localStorage used
**And** Core Web Vitals (LCP, INP, CLS) are monitored via real user metrics
**And** only analytics provider + GitHub API are third-party requests
**And** analytics works per-route (each status page tracked independently)
