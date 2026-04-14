---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
lastStep: 14
workflowStatus: complete
completedDate: '2026-04-14'
inputDocuments:
  - '_bmad-output/planning-artifacts/prd.md'
  - '_bmad-output/planning-artifacts/architecture.md'
  - '_bmad-output/project-context.md'
---

# UX Design Specification — Simulateur de Rémunération

**Author:** Jeff
**Date:** 2026-04-13

---

## Executive Summary

### Project Vision

A French financial literacy platform that makes transparent the complete journey of every euro between total activity cost and net pocket money. The visual flow diagram is the product — not a supplement to numbers, but the primary interface for understanding compensation. The platform expands from an existing freelance simulator (5 legal structures) to cover CDI employees, portage salarial, and community-proposed simulators.

Core UX principle: "Never resemble URSSAF." Two inputs produce a first result. No multi-step wizards. The visual renders before the user asks for a number. Depth is available on drill-down — never imposed.

**Mental model clarification:** The platform is ONE tool with multiple entry points — "understand your compensation in France" — not a suite of separate simulators. Users navigate between CDI, freelance, and portage as different lenses on the same question: "where does my money go?" This shared mental model drives navigation coherence and cross-simulator exploration.

### Target Users

**Primary persona:** Marie (CDI employee) — largest addressable audience (18M+ salaried workers in France), lowest barrier to entry (one input: net salary), highest viral potential (sharing at lunch, with partner). The CDI simulator validates whether the visual approach generalizes beyond freelancers.

**Secondary personas (by priority):**

| Persona | Context | Primary Need | Device Bias |
|---------|---------|-------------|-------------|
| Thomas, 35, senior developer | Wants to go freelance, paralyzed by status choice | Compare legal structures with real numbers | Desktop (deep exploration) |
| Camille, 22, master's student | Confused by job offers quoting "35k brut" | Compare offers with real net numbers | Mobile (WhatsApp sharing) |
| Yuki, 31, Japanese engineer | New to France, zero understanding of French taxes | Understand what "cotisations sociales" buys | Mobile-first |
| Léo, 40, IT consultant | Wants freelance freedom, needs social protections | Compare CDI vs portage vs SASU side-by-side | Desktop (decision session) |
| Antoine, 45, HR director | Uses simulator for onboarding, wants CDD simulator | Propose simulators, community engagement | Desktop (professional use) |

**Tech-savviness range:** Student to senior developer — design must work for least tech-savvy without condescending to advanced users.

**Usage patterns:** Mobile for discovery and sharing, desktop for deep comparison sessions.

### Key "Aha" Moments by Persona

Each persona has a specific insight the visual must reveal instantly — this is what the design optimizes for:

| Persona | Revelation | Visual Trigger |
|---------|-----------|---------------|
| Marie | "My employer pays 75% more than what I see in my bank account" | Flow diagram showing employer cost → visible deductions → net |
| Thomas | "In micro I keep 58% net, in SASU only 35% — but SASU lets me capitalize at 15% IS" | Side-by-side comparison bars with mode A/B toggle |
| Yuki | "The 22% isn't taken away — it buys healthcare, retirement, unemployment" | Human-readable labels on each flow node ("What you pay for retirement") |
| Camille | "The 33k + variable job actually nets more than 38k fixed" | Two simulations compared with same visualization |
| Léo | "Portage: safe but 8% fee. SASU: more net, no unemployment. I can SEE the trade-off" | Cross-simulator comparison with protections highlighted |

### Design Challenges

1. **Fiscal complexity vs radical simplicity.** Five regimes × two modes × IR/IS × IS threshold × fiscal shares = dozens of combinations. Entry must be minimal (2 inputs), depth discovered progressively. Risk: oversimplify (lose trust) or overexpose (cause paralysis).

2. **Multi-simulator coherence.** Users navigate between CDI, freelance, and portage — often in the same session. Design must maintain a common visual structure while adapting to regime-specific concepts (employer cost for CDI, management fee for portage, holding for SASU).

3. **Rich visualizations on mobile.** Sankey, treemap, and flow diagrams are inherently desktop-scale. Below 640px, the design must provide an alternative that preserves the educational value of visual flow — not just a fallback number table. Options to explore: vertically stacked flow cards, simplified proportional bars, swipeable breakdown cards.

### Design Opportunities

1. **Visual flow as "aha" amplifier.** The design should engineer each persona's specific revelation moment (see table above) through animation, explanatory labels, and smooth transitions between views. The visual isn't decoration — it IS the comprehension mechanism.

2. **Return scenarios as engagement driver.** Users return not to "share a URL" but to ask "what if?" — what if I went freelance, what if rates change, what if I took a raise. URL shareability is a consequence of state-in-URL architecture, not a UX strategy. Design should optimize for scenario exploration and comparison, with sharing as a natural side effect.

3. **Identity-based landing page.** "Who are you?" as entry point — routing by profile (employee, freelancer, comparator) creates a personalized journey from the first second, reducing cognitive load and increasing relevance.

### Validation Approach

Design assumptions to validate with real users before committing to implementation:
- Does the 2-input entry actually work, or do users need more context upfront?
- Is the Sankey/flow diagram the right visualization, or do users prefer simpler bar breakdowns?
- Do CDI employees care about employer cost visibility, or is it a "nice to know" without action?
- What triggers scenario comparison — a life event, a conversation, a job offer?

## Core User Experience

### Defining Experience

The fundamental interaction loop: enter an amount → instantly see the visual flow decomposition of where every euro goes → compare what changes when you choose a different status. This is not a calculator — it's a **live decision-making tool for fiscal strategy**.

The core action is: **"Compare in real-time what changes when I choose a status — no form, no delay, no incomprehensible numbers."** This elevates the positioning from "pretty calculator" to "personal fiscal strategy tool." The visual flow diagram is the answer, not a number at the end of a form. The live comparison is the moat — URSSAF won't do it (bureaucracy), accountants won't do it (they sell advice), and other simulators do A/B in forms while we do live visual comparison.

### Platform Strategy

| Dimension | Decision | Rationale |
|-----------|----------|-----------|
| Platform | Responsive web (Next.js App Router) | No native app — web covers all personas |
| Primary input | Touch + mouse/keyboard | Sliders must be equally fluid on both |
| Mobile approach | Mobile-first for discovery, desktop for deep exploration | Marie/Camille discover on mobile, Thomas/Léo explore on desktop |
| Offline | Not required | 100% static via CDN, no user data to store |
| Authentication | None | Zero auth, zero cookies — URL IS the state |
| State persistence | URL query parameters (nuqs) | Every scenario is a shareable, bookmarkable link |

**Technical prerequisites (from architecture review):**
- Lazy-load chart libraries aggressively — only load Sankey/Flow/Treemap when the user navigates to those views. Without this, TTI on mobile 3G = 2-3s instead of <1s.
- Split the monolithic orchestrator component before multi-simulator expansion — per-domain components (`StatusSelector`, `ComparisonGrid`, `DetailFlow`) with centralized orchestration.
- Mobile visualization is not "same chart, different size" — it requires dedicated alternative layouts. Budget specific effort for touch interaction on 3 different chart libraries.

### Persona-Specific Entry Paths

Users don't all enter the same way. The landing page routes by identity, and each path focuses the experience:

| Entry | Persona | First Screen | What's Hidden |
|-------|---------|-------------|---------------|
| "I'm an employee" | Marie, Yuki, Camille | CDI simulator — enter net salary → see employer cost flow | Freelance statuses, holding, mode B |
| "I'm freelance / independent" | Thomas | Freelance simulator — enter CA → see 5-status comparison | CDI, portage |
| "I want to compare options" | Léo | Cross-simulator landing — CDI vs freelance vs portage | Nothing hidden, full comparison mode |
| "Portage salarial" | Léo (direct) | Portage simulator — enter CA → see fee + contributions flow | Other statuses as secondary |

**Key insight (from UX review):** Marie doesn't need to see 5 freelance statuses. Thomas doesn't need CDI entry. The "switch status" interaction is powerful, but it must be contextual — not a global 5-way selector dumped on every user. Progressive disclosure applies to status selection too.

### Effortless Interactions

0. **Choose your path** — Landing page: "Who are you?" → one tap routes to the right simulator with the right defaults. No decision fatigue.
1. **First result** — 1 input (net salary OR CA), the flow animates immediately. No "calculate" button, no multi-step form. Target: <100ms computation (verified via instrumentation, not assumption).
2. **Switch status** — One click/tap, the flow transforms in place with animation. No reload, no navigation. Contextual to the user's simulator type.
3. **Drill down** — Tap any flow node to see detail with human-readable explanation of what it buys. Back with a gesture. No modal, no separate page.
4. **Compare** — Other statuses visible as miniatures while exploring one in detail. Live: change CA on one, all update.
5. **Share** — URL is always current. Copy link is enough. Rich OG preview when pasted.

**What competitors require that we eliminate:**
- URSSAF: multi-step form → we give a result on first input
- salaire-brut-en-net: single number after calculation → we show the complete journey
- Accountant simulators: marketing funnel → zero signup, zero email

### Critical Success Moments

| Moment | Must Happen | Experience Killer |
|--------|------------|------------------|
| Landing | User identifies themselves in <3s, gets routed to their simulator | Generic page with all options dumped at once |
| First input | Flow appears in <100ms, user grasps the structure | Blank screen, loader, form to fill |
| Aha moment | Marie sees "Your employer pays 4,900€/month — you see 2,800€" with animated flow revealing where 2,100€ goes, each node labeled in plain French | Fiscal jargon, static table, no context |
| Status switch | Smooth transition, flow reorganizes with animation showing what changes | Blank page, reload, context loss |
| Decision moment | Thomas sees SASU vs micro side-by-side, toggles mode B, realizes he can capitalize at 15% IS — the visual makes the trade-off obvious | Numbers in a table without visual comparison |
| Mobile use | Adapted visualization (stacked cards or simplified bars), not a degraded table | Illegible Sankey at 375px, pinch-to-zoom required |
| Sharing | URL copied in 1 tap, rich OG preview when pasted in chat | Broken URL, empty preview, lost parameters |

### Experience Principles

1. **Instant gratification** — One input, one visual result. Never "calculate", never wait.
2. **Progressive disclosure** — Simplicity at first glance, depth available on demand. The user chooses when to dive deeper. This applies to status selection too — don't show all options to everyone.
3. **Visual-first comprehension** — The diagram doesn't illustrate numbers, it IS the comprehension. Numbers complement the visual, not the reverse.
4. **Seamless transitions** — Switching status, mode, or view = in-place transformation. Never a context break.
5. **Self-explanatory labels** — Every flow node says what it buys in plain language. Zero unexplained jargon. "What you pay for retirement", not "Cotisation vieillesse de base".
6. **Live comparison as differentiator** — The ability to see what changes in real-time when switching status/mode is the core moat. Design every interaction to reinforce this.

## Desired Emotional Response

### Closing Emotion

**"Acceptation libérée"** — "I see where it goes, I've chosen." The user closes the simulator feeling lighter, not because the numbers are good, but because the opacity has lifted. They can now discuss, decide, or simply move on with clarity they didn't have before.

This is not satisfaction ("I got my number") or delight ("what a cool tool"). It's the relief of understanding something that was deliberately kept opaque — and the confidence that comes with it.

### Emotional Arc (with Descent)

The emotional journey is not a staircase that only goes up. Discovery of hidden costs creates a real emotional dip that the design must acknowledge and guide through — not smooth over.

| Phase | Emotion | What Happens | Design Response |
|-------|---------|-------------|-----------------|
| 1. Discovery | **Curiosity + relief** | "Finally something that doesn't look like URSSAF." Clean design, one simple question | Warm, inviting landing. No forms, no jargon |
| 2. First result | **Surprise + wonder** | The flow animates instantly — "that's it?" | Progressive unfold animation, not an instant dump |
| 3. The dip | **Shock + ambivalence** | Marie sees 2,100€/month she never knew existed. A freelancer sees 43% charges. This is not joyful | Let the emotion land. Don't rush to explain. Give the user a beat to absorb before labels appear |
| 4. Reconciliation | **Illumination + acceptance** | Each node reveals what it buys: retirement, healthcare, unemployment. "It's not taken — it's a contract" | Human-readable labels appear on interaction. Positive framing: "what this funds" not "what's deducted" |
| 5. Exploration | **Mastery + control** | User manipulates CA, toggles modes, drills down. Each action changes the flow in real-time | Every micro-interaction (slider, toggle, click) gives immediate visual feedback. The user drives |
| 6. Decision | **Empowered clarity** | Thomas sees SASU vs micro side-by-side. The trade-off is visual, not numerical. Fear transforms into informed choice | Comparison as the core differentiator. Neutral presentation — no "best option" badge |
| 7. Closure | **Acceptation libérée** | User has what they need. They share, bookmark, or simply close | No exit gate, no "sign up for more". Clean ending. URL preserved for return |

### Micro-Emotions

| Cultivate | Avoid | Design Lever |
|-----------|-------|-------------|
| **Confidence** | Scepticism | Display "Barème officiel 2026" + source link. Show charges+net=brut invariant visibly |
| **Mastery** | Confusion | Never more than 2-3 controls visible. Every interaction is reversible |
| **Wonder** | Indifference | Flow unfolds progressively on first render. Transitions between statuses are animated |
| **Legitimacy** | Guilt/shame | Never judge the CA, the status, or the number of parts. "Your situation" not "your choice" |
| **Autonomy** | Dependence | Zero recommendations. Zero "best status". The tool shows, the user decides |
| **Legitimate frustration** | Suppressed anger | If a freelancer sees 43% charges and feels angry — that's valid. Don't smooth it with animations. Let them sit with it, then show what it buys |

### Emotional Honesty

**"Neutral" is a myth.** Every color, timing, hierarchy, and animation is a design choice that carries emotional weight. Instead of claiming neutrality, the design commits to **benevolent transparency**:

- We choose to show employer cost — that's a position (most tools hide it)
- We choose positive framing ("what it funds") — that's a position (could frame as "what's taken")
- We choose not to recommend a status — that's a position (accountants do recommend)

Owning these choices openly is more honest than pretending to be neutral. The user trusts a tool that says "here's what we show and why" more than one that claims objectivity.

### Emotional Design Principles

1. **Honor the dip** — Discovery of hidden costs creates shock. Don't rush past it with smooth animations. Give the user a beat to absorb, then guide toward understanding.
2. **Benevolent transparency over false neutrality** — Own the design choices. Show the source, show the math, show the invariant. "We show you this because it matters" not "we're just neutral."
3. **Revelation, not information** — Don't dump numbers. Unfold the flow progressively so each piece of information lands as a discovery. The Sankey animation IS the comprehension mechanism.
4. **Legitimate emotions are all welcome** — Anger at 43% charges, relief at understanding employer cost, anxiety about status choice — all valid. The design doesn't suppress or manufacture emotions, it provides clarity through them.
5. **Positive framing as default, not as whitewash** — "What your contributions buy you" is the default register. But when a user drills down into raw numbers, show them without editorial.
6. **Closure without capture** — The closing emotion is "acceptation libérée." No email gate, no signup prompt, no "share to unlock." The user leaves with what they came for. They return because the tool earned trust, not because it trapped attention.

### Validation Required

These emotional hypotheses must be tested with real users before committing to implementation:
- Does the "dip" (phase 3) actually happen? How strong is it?
- Do users who fear fiscal administration react differently? Is "wonder" accessible to them or does anxiety dominate?
- Is positive framing perceived as honest or as whitewashing?
- What does a freelancer who already chose a status and regrets it feel when using the tool?

## UX Pattern Analysis & Inspiration

### Inspiring Products Analysis

**Qonto (Banking)**
Clean, professional UI with monochrome palette and accent colors. Dense information without feeling cluttered. Key lesson: financial data can feel premium and trustworthy through restrained design — dark backgrounds, generous spacing, clear typography hierarchy.

**Apple (General UX)**
Progressive disclosure as core philosophy — complexity exists but is never imposed. Every default is carefully chosen. Animations serve comprehension, not decoration. Key lesson: the best feature is the one the user discovers when they need it.

**Typeform (Form UX)**
One question at a time. Each screen feels like a conversation, not a form. Key lesson: presenting inputs sequentially with visual feedback creates flow state instead of form fatigue. Relevant for the landing page "Who are you?" routing.

**Interactive Brokers (Anti-pattern)**
50+ data points on a single screen. Information overload creates paralysis. Key lesson: what NOT to do — never dump all options on every user.

**Engaging Data — Tax Brackets v2**
Hover on any flow reveals the exact calculation inline — no modal, no tooltip. URL updates with every parameter change. Key lesson: hover/tap-to-reveal is perfect for explaining individual contribution lines without leaving the diagram.

**Finary Budget Calculator**
Pre-filled form with realistic examples. Two key metrics immediately visible: current vs possible. Key lesson: a single delta metric ("you keep 12k€ more in mode B") communicates a comparison faster than two side-by-side diagrams.

**SmartAsset Paycheck Calculator**
Accordion hierarchy: Gross > Taxes > FICA > Deductions > Take Home. No charts — just expandable sections. Extremely mobile-friendly. Key lesson: the existing `Section` component pattern in the codebase already does 80% of this.

**Pay44 Paycheck Calculator**
Waterfall vertical chart showing "where each dollar goes" from gross. Bars descend: each deduction starts where the previous ends. Key lesson: the waterfall vertical cascade is the most intuitive pattern for "CA descending toward NET."

### Hero Visualization: The Cascade Flow

**Critical design decision:** The Sankey diagram is REMOVED. The hero visualization is a **vertical cascade of cards** showing money flowing from CA through deductions to NET. This is the product's core differentiator — not a chart, but a comprehension mechanism.

#### What the User Sees (Marie enters 2,800€ net salary)

**Frame 1 — Entry (t=0ms):**
Dark screen (#0A0E14). Input with "2 800 €" at the top. Below: "Où va ton argent?" Title. Nothing else. Calm, clean.

**Frame 2 — Cascade appears (t=50ms to 500ms):**
Cards slide in from top to bottom, stagger 80ms each, spring easing. Each card shows:
- Left: label in plain French ("Cotisations sociales")
- Right: amount in JetBrains Mono Bold
- Full width: colored proportional bar

```
┌─────────────────────────────────┐
│  Coût employeur    4 900 €      │  ← accent color, full bar
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │
├────────── ↓ ────────────────────┤
│  Cotisations       1 400 €      │  ← red bar, proportional
│  ▓▓▓▓▓▓▓▓▓▓                    │
├────────── ↓ ────────────────────┤
│  Impôt sur revenu    700 €      │  ← orange bar
│  ▓▓▓▓▓                         │
├────────── ↓ ────────────────────┤
│  NET EN POCHE      2 800 €      │  ← green emerald, LARGE font
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓           │
└─────────────────────────────────┘
```

**Frame 3 — Tap to reveal (t=user interaction):**
User taps "Cotisations sociales" → card expands with slide-down animation showing:
- "Retraite: 680€ — What you build toward your pension"
- "Maladie: 420€ — Healthcare coverage at 70%"
- "Chômage: 300€ — 57% of gross for up to 2 years if you lose your job"
Rest of cascade dims to 40% opacity.

**Frame 4 — Parameter change (t=user moves slider):**
User changes CA → all numbers animate smoothly (useAnimatedNumber, 800ms). Bars resize with CSS transition. Green NET grows or shrinks. Immediate visual feedback.

**Frame 5 — Status switch:**
User taps another status → cascade morphs: colors change (blue→purple), bars resize, new deduction lines appear/disappear. Smooth, no page reload.

#### Visual Specifications

| Element | Value |
|---------|-------|
| Background | `#0A0E14` (blue-black, premium depth) |
| Card background | `#1A202C` |
| Card border | `1px solid #ffffff0d` (white 5% opacity) |
| Card radius | `6px` |
| Bar height | `32px` desktop / `24px` mobile |
| Bar colors | CA: status accent, Charges: `#EF4444`, Tax: `#F97316`, Net: `#10B981` |
| Font amounts | JetBrains Mono Bold, `15px` desktop / `12px` mobile |
| Font labels | Inter/system, `13px` desktop / `11px` mobile |
| Container max-width | `600px` centered |
| Gap between cards | `16px` desktop / `12px` mobile |
| Padding | `32px` desktop / `20px` mobile |
| Animation easing | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` |
| Stagger delay | `80ms` per card |
| Total animation | `<600ms` |
| Number animation | `800ms` via useAnimatedNumber (anime.js) |

#### Technical Implementation

**Stack:** Pure CSS transitions + Tailwind + anime.js (already installed). Zero new dependencies.

**Components:**
- `CascadeFlow.tsx` — orchestrator, builds items from SimResult, manages expanded state
- `CascadeCard.tsx` — individual card with proportional bar, stagger via inline `transitionDelay`
- `CascadeDetail.tsx` — tap-to-reveal panel with human-readable breakdown

**Animation approach:**
- Stagger: `style={{ transitionDelay: \`${index * 80}ms\` }}`
- Bar width: CSS `transition: width 500ms cubic-bezier(0.16, 1, 0.3, 1)`
- Numbers: existing `useAnimatedNumber` hook (anime.js)
- Re-trigger on CA change: toggle `.cascading` class on container

**Estimated effort:** ~8 hours

**What's removed:**
- @nivo/sankey + D3 transitive dependency (~80KB gzip saved)
- `lib/sankey.ts` (148 lines of dead transformation code)
- Sankey tab/view from UI

**What's kept:**
- Recharts: ComparisonMini (bar comparison of all statuses), RepartitionBar (horizontal breakdown %), TreemapDetail (drill-down)
- @xyflow/react: UNDER REVIEW — may be kept as optional "pedagogical mode" or replaced by cascade. Decision deferred to implementation.

### Transferable UX Patterns

| Pattern | Source | Application |
|---------|--------|-------------|
| One question at a time | Typeform | Landing page: "Who are you?" → one tap → right simulator |
| Pre-filled realistic defaults | Finary | CA default = INSEE median for the regime |
| Hover/tap-to-reveal detail | Engaging Data | Tap a cascade card → see breakdown with human labels |
| Delta metric for comparison | Finary | "You keep 8,400€ more in mode B" as highlighted number |
| Animated number transitions | Pay44 | useAnimatedNumber on every amount when CA changes |
| Accordion hierarchy | SmartAsset | Detail panel expands inline, rest dims |
| Stagger cascade animation | Motion.dev patterns | Cards appear sequentially, 80ms delay, spring easing |

### Anti-Patterns to Avoid

| Anti-Pattern | Source | Why It Fails |
|-------------|--------|-------------|
| Information overload | Interactive Brokers | 50+ data points = paralysis. Max 5-7 cascade cards |
| Hidden affordances | BudgetFlow | Toggles (IS threshold, mode A/B) must be visible and labeled |
| Opaque jargon labels | BudgetFlow | "Mode B" means nothing. Use "Capitalisation (garder en société)" |
| Multi-step wizard | URSSAF | Forces completion before showing any result |
| Email gate before results | Accountant simulators | Zero-signup, zero-email |
| Sankey on mobile | All Sankey tools | Unreadable below 640px. The cascade is mobile-native |
| Animation as decoration | Generic | Every animation communicates a state change. No gratuitous motion |
| Tooltips as primary explanation | Generic | Invisible on mobile. Use inline labels or expand-on-tap |

## Design System Foundation

### Design System Choice

**Approach:** Themeable system — Tailwind CSS v4 + shadcn/ui (curated subset)

This is not a new decision — it's a formalization of the existing stack. The project already uses Tailwind v4 with custom CSS variables and shadcn/ui components. The design system work is cleanup and standardization, not adoption.

### Rationale for Selection

1. **Already in place** — Tailwind v4 + shadcn/ui are installed and functional. Switching would create debt, not reduce it.
2. **Solo developer** — shadcn/ui is copy-paste (no dependency lock-in). Components live in `components/ui/` and can be modified freely.
3. **Custom hero visualization** — The cascade flow is hand-built CSS. No design system provides this. The system only needs to handle peripheral UI (inputs, sliders, toggles, cards).
4. **Dark theme established** — CSS variables for semantic colors (bg-primary, text-secondary, per-regime accents) already exist in `globals.css` via `@theme`.
5. **Performance** — shadcn/ui has zero runtime overhead (it's just components). Tailwind purges unused styles.

### Implementation Approach

**Phase 1 — Cleanup (from architecture doc recommendations):**
- Remove 7 unused shadcn components (badge, button, card, tabs, slider, separator, tooltip)
- Remove `@base-ui/react` dependency (only consumed by dead components)
- Keep: `currency-input`, `range-slider`, `chart` (active)

**Phase 2 — Standardize tokens:**
- Consolidate color definitions: `globals.css` CSS variables are canonical, `lib/colors.ts` (new) exports them for JS consumption (chart libraries)
- Typography scale: JetBrains Mono for all numeric values, Inter for labels/text
- Spacing: Tailwind default scale (4px base)
- Border radius: 6px for cards, 4px for inputs (already consistent)

**Phase 3 — Add components as needed:**
- Cascade flow cards — custom, not shadcn (specific to this product)
- Toggle group for mode A/B, IR/IS — evaluate shadcn `toggle-group` or custom
- Bottom sheet for mobile detail — evaluate shadcn `drawer` or custom

### Customization Strategy

**Design tokens (CSS variables in globals.css):**

| Token | Value | Purpose |
|-------|-------|---------|
| `--color-bg-primary` | `#0A0E14` | App background |
| `--color-bg-card` | `#1A202C` | Card/surface background |
| `--color-border` | `#ffffff0d` | Subtle borders (white 5%) |
| `--color-micro` | `#3B82F6` | Micro-entreprise accent |
| `--color-ei` | `#06B6D4` | EI accent |
| `--color-eurl` | `#10B981` | EURL accent |
| `--color-sasu` | `#A855F7` | SASU accent |
| `--color-holding` | `#F59E0B` | Holding accent |
| `--color-charge` | `#EF4444` | Deduction/charge bars |
| `--color-tax` | `#F97316` | Tax bars |
| `--color-net` | `#10B981` | Net result (green) |

**Typography:**

| Usage | Font | Weight | Size (desktop/mobile) |
|-------|------|--------|----------------------|
| Amounts, numbers | JetBrains Mono | 700 | 15px / 12px |
| Labels, descriptions | Inter | 400-500 | 13px / 11px |
| Hero NET number | JetBrains Mono | 700 | 28px / 22px |
| Section titles | Inter | 600 | 18px / 16px |

**Component conventions:**
- All interactive elements: visible focus ring, keyboard navigable
- Card pattern: `bg-card border border-border rounded-md p-4`
- Hover state: `+4% luminosity` (no color change, just brightness lift)
- Transitions: `200ms ease-out` for UI, `500ms cubic-bezier` for data viz

## Core User Experience (Detailed)

### Defining Experience

**One-sentence pitch:** "Enter your salary, see where every euro goes."

This is a novel combination of familiar patterns: the input is a standard form field (familiar), but the output is a live animated cascade showing money flowing through deductions (novel). No other French tool visualizes the journey — they all give a number at the end of a form.

The defining interaction is NOT "calculate" — it's "reveal." The cascade animation makes the invisible visible. Users don't compute; they discover.

### User Mental Model

**What users bring:**
- "I know my net salary. I don't know what happens between my employer's cost and my bank account."
- "Simulators give me a number after I fill out a form." (URSSAF mental model)
- "I expect to need to give a lot of information before getting a result." (accountant mental model)
- "Tax stuff is complicated, I'll probably need help understanding the result." (anxiety model)

**Where we break expectations (positively):**
- One input → full visual result (vs. multi-step form)
- The result IS the explanation, not a number to interpret (vs. "your net is 2,800€")
- No signup, no email, no wait (vs. accountant consultation)
- The URL IS the save button (vs. "create an account to save")

**Where users might get confused:**
- "What's Mode A vs Mode B?" → Must use plain language: "All as salary" vs "Keep profit in company"
- "What are fiscal shares?" → Inline micro-explanation: "1 = single, 2 = couple, +0.5 per child"
- "Which status should I pick?" → We don't answer this. We show the numbers, user decides.

### Success Criteria

| Criterion | Measure | Target |
|-----------|---------|--------|
| Time to first insight | From page load to cascade visible | <2 seconds (including animation) |
| Comprehension | User can explain where their money goes | After 30 seconds of exploration |
| Comparison clarity | User can identify which status keeps more net | Within 1 status switch |
| Trust | User believes the numbers are correct | Source attribution visible, invariant displayed |
| Mobile usability | Full cascade readable without horizontal scroll | On 375px viewport |
| Sharing | User can reproduce exact scenario via URL | 100% state in URL params |
| Return trigger | User thinks of a "what if" scenario to explore | Within first session |

### Novel UX Patterns

**The Cascade Flow** is the novel pattern. It combines:
- **Waterfall chart** logic (each step starts where the previous ends)
- **Card-based progressive disclosure** (tap to reveal detail)
- **Animated stagger** (cards appear sequentially, creating narrative rhythm)
- **Live parameter binding** (slider moves → cascade morphs in real-time)

This pattern doesn't exist in any competing tool. It's not a chart — it's a comprehension mechanism. The animation timing (80ms stagger, <600ms total) is calibrated to feel like "revealing," not "loading."

**Familiar patterns used:**
- Slider for CA input (universal)
- Toggle for binary choices (mode A/B, IR/IS)
- URL state persistence (web standard)
- Dark premium aesthetic (Qonto/fintech standard)

**Education strategy:** No onboarding tutorial. The cascade itself teaches — each card's label explains what it is. "Cotisations sociales: What you pay for retirement, healthcare, and unemployment." Learning happens through reading the cascade, not through a separate flow.

### Experience Mechanics

**1. Initiation:**
- Landing page: "Who are you?" → Employee / Freelance / I want to compare
- One tap routes to the right simulator with sensible defaults (INSEE median CA)
- Input field is pre-focused, ready to type

**2. Interaction (the core loop):**

User types/slides CA amount → Engine computes all variants (pure functions, <1ms) → Cascade cards rebuild with new data → CSS transitions animate: bars resize, numbers count up/down → Stagger delay creates top-to-bottom "flow" effect → Total animation <600ms → URL updates silently (nuqs)

**3. Feedback:**
- **Immediate:** Numbers animate as soon as slider moves (no debounce on visual feedback)
- **Proportional:** Bar widths change proportionally — user SEES the impact
- **Color-coded:** Red = deduction, orange = tax, green = what you keep
- **Invariant visible:** "Charges + Impôts + Net = CA" always displayed, always true
- **Error prevention:** Input clamped to valid ranges, no invalid states possible

**4. Exploration (drill-down):**
- Tap any cascade card → expands inline with detailed breakdown
- Each detail line: human-readable label + amount + what it funds
- Rest of cascade dims (40% opacity) to focus attention
- Tap again or tap elsewhere → collapse

**5. Comparison (status switch):**
- Tap another status in the selector → cascade morphs
- Colors change (accent per status), bars resize, new lines may appear/disappear
- Delta metric appears: "±X€ vs [previous status]"
- Animation: smooth morph, not page reload

**6. Completion:**
- There is no "done" state — the tool is exploratory
- User closes tab when satisfied (acceptation libérée)
- URL is always current — bookmarkable, shareable
- No exit prompt, no "save your results" gate

## Visual Design Foundation

### Color System

**Philosophy:** Monochrome zinc foundation with surgical color accents. Color is reserved exclusively for meaning — status identification, charge/tax/net semantics, and interactive states. Everything else is grayscale zinc. This creates maximum signal-to-noise ratio for financial data.

**Background scale (zinc):**

| Token | Value | Usage |
|-------|-------|-------|
| `--color-bg-primary` | `#09090b` | Page background (zinc-950) |
| `--color-bg-card` | `#18181b` | Cards, surfaces (zinc-900) |
| `--color-bg-elevated` | `#27272a` | Elevated surfaces, hover states (zinc-800) |

**Border scale:**

| Token | Value | Usage |
|-------|-------|-------|
| `--color-border-subtle` | `#27272a` | Card borders, dividers (zinc-800) |
| `--color-border-default` | `#3f3f46` | Input borders, active borders (zinc-700) |
| `--color-border-strong` | `#52525b` | Focus rings, emphasis (zinc-600) |

**Text scale:**

| Token | Value | Ratio vs bg-primary | Usage |
|-------|-------|-------------------|-------|
| `--color-text-primary` | `#fafafa` | 19.5:1 (AAA) | Headings, amounts, primary content |
| `--color-text-secondary` | `#a1a1aa` | 7.2:1 (AA) | Labels, descriptions, metadata |
| `--color-text-tertiary` | `#71717a` | 4.0:1 (AA large only) | Large labels only (>=18px). NEVER for body text |

**Accent (interactive):**

| Token | Value | Usage |
|-------|-------|-------|
| `--color-accent` | `#6366f1` | Links, active indicators, focus rings, cascade card left border |
| `--color-accent-hover` | `#818cf8` | Hover state |
| `--color-accent-muted` | `#6366f122` | Subtle backgrounds |

**Semantic colors (data visualization):**

| Token | Value | Ratio vs bg-card | Usage |
|-------|-------|-----------------|-------|
| `--color-negative` | `#f43f5e` | 5.2:1 (AA) | Charges, deductions |
| `--color-tax` | `#f59e0b` | 6.4:1 (AA) | Taxes, IR/IS |
| `--color-positive` | `#22c55e` | 5.8:1 (AA) | Net result, gains |

**Per-status accents:**

| Token | Value | Status |
|-------|-------|--------|
| `--color-micro` | `#60a5fa` | Micro-entreprise |
| `--color-ei` | `#2dd4bf` | EI |
| `--color-eurl` | `#34d399` | EURL |
| `--color-sasu` | `#a78bfa` | SASU |
| `--color-holding` | `#fbbf24` | Holding |

**Color rules:**
- Background surfaces: ONLY zinc scale. Never colored backgrounds (except 8% opacity semantic tint on cascade cards).
- Text: ONLY zinc scale. Colored text only for amounts in the cascade.
- Color appears ONLY in: cascade bars, status accents, semantic indicators, interactive focus states.
- **WCAG 1.4.1 compliance:** Color is NEVER the sole differentiator. Every colored element also has: a distinctive icon, a text label, and an aria-label. This is mandatory for charges/taxes/net distinction in the cascade.

### Cascade Card Visual Treatment

**Card enhancement (from agent review):**

```css
/* Cascade card — enhanced for visual flow */
.cascade-card {
  background: #18181b;                          /* bg-card */
  border: 1px solid #363636;                    /* slightly brighter than border-subtle for clarity */
  border-left: 2px solid var(--color-accent);   /* directional accent — guides the eye down */
  border-radius: 6px;
}

/* Semantic tint — very subtle colored background per card type */
.cascade-card[data-type="charge"] {
  background: linear-gradient(135deg, rgba(244,63,94,0.08) 0%, #18181b 100%);
}
.cascade-card[data-type="tax"] {
  background: linear-gradient(135deg, rgba(245,158,11,0.08) 0%, #18181b 100%);
}
.cascade-card[data-type="net"] {
  background: linear-gradient(135deg, rgba(34,197,94,0.08) 0%, #18181b 100%);
}
```

**Each cascade card includes (WCAG 1.4.1 compliance):**
- Distinctive icon (e.g., ArrowDownCircle for charges, Percent for taxes, Wallet for net)
- Text label in plain French
- Colored bar (semantic color)
- aria-label with full context: "Cotisations sociales: 12 500 euros, 25% du chiffre d'affaires"

### Typography System

**Font stack:**

| Role | Font | Variable |
|------|------|----------|
| Text, labels, UI | Inter | `--font-sans` |
| Numbers, amounts | JetBrains Mono | `--font-mono` |

**Type scale:**

| Element | Font | Weight | Size (desktop/mobile) | Line height |
|---------|------|--------|----------------------|-------------|
| Hero NET amount | JetBrains Mono | 700 | 32px / 24px | 1.1 |
| Cascade amounts | JetBrains Mono | 700 | 18px / 15px | 1.2 |
| Cascade detail amounts | JetBrains Mono | 500 | 14px / 12px | 1.3 |
| Section titles | Inter | 600 | 18px / 16px | 1.3 |
| Card labels | Inter | 500 | 14px / 12px | 1.4 |
| Body text | Inter | 400 | 14px / 13px | 1.5 |
| Micro-explanations | Inter | 400 | 12px / 11px | 1.4 |

**Rules:**
- All financial amounts: JetBrains Mono with `font-variant-numeric: tabular-nums`
- Amounts formatted with `fmt()`: "XX XXX €" (fr-FR locale, non-breaking space)
- text-tertiary (#71717a) restricted to text >=18px only

### Spacing & Layout

**Base unit:** 4px (Tailwind default)

| Breakpoint | Layout | Cascade width | Controls |
|-----------|--------|--------------|----------|
| <640px | Single column | 100% - 40px padding | Collapsible top bar |
| 640-1024px | Single column, centered | max-width 600px | Collapsible top bar |
| >1024px | Two columns | max-width 600px | Fixed left sidebar 280px |

**Spacing:**
- Between cascade cards: 16px desktop / 12px mobile
- Card internal padding: 24px desktop / 16px mobile
- Between major sections: 32px
- Container padding: 32px desktop / 20px mobile

### Accessibility (RGAA 4.1)

**Contrast:** All pairs verified AA minimum. text-tertiary restricted to large text.

**WCAG 1.4.1 (Use of Color):** Color never sole differentiator. Every cascade card has icon + text label + color bar. Protanopia-safe by design.

**WCAG 2.4.7 (Focus Visible):** All interactive elements have visible focus outline:
```css
.interactive:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
```

**Keyboard navigation:** All cascade cards focusable with `role="button"`, `tabIndex={0}`, `aria-expanded`. Tab order matches DOM order (top-to-bottom cascade).

**Screen reader:** Dynamic `aria-label` on each card with full context. `aria-live="polite"` on expanded detail regions.

**Motion:** `prefers-reduced-motion` respected — stagger disabled, all cards shown instantly. No auto-playing animations.

**Zoom:** Functional at 200%. All layouts use relative units.

## Design Direction Decision

### Design Directions Explored

A single converged direction emerged from iterative agent collaboration (UX, Visual, Architecture, Storytelling, Design Thinking, SEO/A11y). Rather than exploring 6-8 divergent options, the design evolved through progressive refinement:

1. Initial assumption: Sankey diagram as hero visualization → **rejected** (unreadable on mobile, too complex for the core "where does money go?" question)
2. ReactFlow as hero → **reconsidered** (powerful but heavy for a linear flow, implementation to be decided)
3. **Vertical cascade of cards** → **converged direction** (mobile-native, progressive disclosure, animated stagger, tap-to-reveal)

### Chosen Direction

**The Cascade Flow** — A vertical sequence of cards showing money entering (CA) and being distributed through deductions (cotisations, abattement, IR/IS) to the final NET amount. Each card has:

- Distinctive icon + text label (WCAG 1.4.1 compliant)
- Proportional colored bar showing magnitude relative to CA
- Semantic color tint (8% opacity gradient background)
- Accent left border for directional flow
- Tap-to-reveal detail panel with human-readable breakdown

**Interactive HTML mockup:** `_bmad-output/planning-artifacts/ux-design-directions.html`

The mockup demonstrates:
- Landing page with identity-based routing ("Who are you?")
- Freelance cascade (Micro BNC: CA → Cotisations → Abattement → IR → NET)
- CDI cascade (Employer cost → Patronales → Salariales → IR → NET)
- Mobile 375px preview
- Stagger animation (80ms per card)
- Tap-to-reveal detail on each card
- Comparison grid of all 5 statuses
- Full zinc monochrome theme with semantic color accents

### Design Rationale

1. **Mobile-native by structure** — A vertical card list IS a mobile layout. No adaptation needed, just responsive spacing.
2. **Progressive disclosure built-in** — Hero NET number + card labels visible immediately. Detail on demand via tap.
3. **Emotionally honest** — Each deduction is visible and labeled. The "dip" (discovering hidden costs) happens naturally as cards appear. Reconciliation happens when user taps and reads "What you pay for retirement."
4. **Technically minimal** — CSS transitions + Tailwind + anime.js (existing). Zero new dependencies. ~8h implementation.
5. **Sankey removed** — @nivo/sankey + D3 dropped (-80KB gzip). `lib/sankey.ts` (148 lines) becomes dead code.
6. **@xyflow/react** — Under review. May be kept as optional pedagogical mode or replaced entirely by the cascade. Decision deferred to architecture/implementation phase.

### Implementation Approach

**Components to build:**
- `CascadeFlow.tsx` — Orchestrator (builds items from SimResult, manages expanded state)
- `CascadeCard.tsx` — Individual card (icon, label, amount, bar, stagger delay)
- `CascadeDetail.tsx` — Tap-to-reveal panel (detail grid with human labels)

**Animation:** CSS transitions with inline `transitionDelay` for stagger. `useAnimatedNumber` (anime.js, existing) for number transitions.

**Estimated effort:** ~8 hours for core cascade. +2-4 hours for comparison grid and delta metric integration.

## User Journey Flows

### Journey 1: Marie — "Where Does My Money Go?" (CDI Employee)

**Entry:** Google "cout employeur salaire" → lands on `/` → taps "Salarié(e)"

**Flow:**
1. Landing page → tap "Salarié" → CDI simulator
2. Input pre-focused → types "2800" (net mensuel)
3. Cascade animates: 4 cards stagger in (employer cost → patronales → salariales → IR → NET)
4. THE DIP: Marie sees employer cost 4,872€ — shock
5. Taps "Cotisations patronales" → detail expands: retraite, maladie, chômage with human labels
6. RECONCILIATION: "It buys healthcare + retirement"
7. Slides salary to 3,500€ → cascade morphs live
8. Sees invariant (charges + net = employer cost) → TRUST established
9. Copies URL → shares with partner/colleagues
10. CLOSURE: acceptation libérée

**Timing:** T+0s landing → T+1s input → T+3s cascade → T+5s dip → T+10s detail → T+30s exploration → T+60s share

### Journey 2: Thomas — "Which Status Keeps More?" (Freelance Comparison)

**Entry:** Reddit thread → lands on `/` → taps "Indépendant(e)"

**Flow:**
1. Freelance simulator → CA input (default 80k) → Micro active by default
2. Cascade: CA → Cotisations → Abattement → IR → NET (38,016€ — 47.5%)
3. Comparison grid visible below: 5 statuses with net amounts
4. Taps "SASU" pill → cascade morphs, delta appears: "-6,816€ vs Micro"
5. Taps cotisations card → detail: SASU charges ~77% vs Micro 25.6%
6. Toggles "Capitalisation" (Mode B) → IS 15% card appears, capital card added
7. New NET with capitalization: different picture entirely
8. Toggles IS seuil 100k → extended threshold changes IS calculation
9. Compares 3 scenarios, shares URL with wife
10. Books accountant with SPECIFIC questions

**Key:** Status switch = cascade morph with delta. Progressive complexity: Micro (simple) → SASU Mode B + IS threshold (advanced) — user CHOOSES to go deeper.

### Journey 3: Léo — "CDI vs Portage vs SASU" (Cross-Simulator)

**Entry:** Google "portage salarial simulation" → taps "Comparer"

**Flow:**
1. Comparison mode → input: revenue target (65k gross)
2. Three cascades: CDI (employer cost 92k → net 50k) | Portage (CA 85k - 8% fee → net 47k) | SASU (CA 85k → net 44k + capital)
3. Desktop: side-by-side columns. Mobile: tabs (CDI | Portage | SASU) with swipe
4. Léo taps Portage "Management fee" → detail: 8% = 6,800€ to portage company
5. Adjusts fee slider (5-15%) → portage cascade morphs
6. Taps SASU "Net" card → detail: no unemployment, but 15% IS on capital
7. DECISION: Portage as transition step
8. Copies comparison URL → shares with wife

### Journey Patterns

**Navigation:**
- Identity routing: Landing → 1 tap → right simulator
- Status pills: horizontal scrollable, colored border when active
- Tab comparison: mobile tabs with swipe, desktop side-by-side

**Interaction:**
- Input → immediate cascade (no "calculate" button)
- Tap-to-reveal: card expands inline, rest dims 40%
- Delta on switch: "±X€ vs previous" after every status/mode change
- Progressive controls: basic always visible, advanced revealed by user choice

**Feedback:**
- Number animation: 800ms on every change (useAnimatedNumber)
- Bar resize: 500ms CSS transition
- Stagger on load: 80ms per card
- Invariant: "Charges + Impôts + Net = CA ✓" always visible
- Source: "Barème officiel 2026" non-intrusive attribution

**Error prevention:**
- Inputs clamped to valid ranges, no invalid states possible
- Regime-specific warnings inline (e.g., "Above micro BNC cap")
- No error modals — inline feedback only

### Flow Optimization Principles

1. **Zero-step-to-value:** Landing → 1 tap → 1 input → cascade. Max 3 interactions to first insight.
2. **No dead ends:** Every view has a visible next action.
3. **Reversible everything:** Every exploration undoable. URL preserves state.
4. **Complexity is earned:** Start with 1 input, 1 status. Advanced features unlocked by user choice, never imposed.
5. **Comparison is king:** Two states side-by-side (desktop) or sequential (mobile) = core differentiator.

## Component Strategy

### Design System Components (Keep)

| Component | File | Usage |
|-----------|------|-------|
| CurrencyInput | `ui/currency-input.tsx` | CA/salary input with formatting |
| RangeSlider | `ui/range-slider.tsx` | CA slider, management fee slider |
| Chart | `ui/chart.tsx` | Recharts wrapper (ComparisonMini, RepartitionBar) |

**Remove (dead code):** badge, button, card, tabs, slider, separator, tooltip + `@base-ui/react`.

### Custom Components (To Build)

**CascadeFlow** — Orchestrator for the vertical cascade. Builds CascadeCard items from SimResult, manages expanded state, triggers re-animation on parameter change. Props: `simResult`, `statusColor`. Container: `role="list"`.

**CascadeCard** — Single deduction step. Anatomy: distinctive icon + label/sublabel + amount (JetBrains Mono, colored) + percentage + proportional bar + expandable detail. States: collapsed, expanded, dimmed. Accessibility: `role="button"`, `aria-expanded`, `aria-label` with full context.

**CascadeDetail** — Tap-to-reveal panel. Grid of detail rows (label + amount + human description). Animated slide-down. `aria-live="polite"`.

**HeroNet** — Large NET amount with percentage and source attribution. `aria-live="polite"`. Number animation on change.

**StatusPills** — Horizontal pill selector (Micro, EI, EURL, SASU, Holding). `role="radiogroup"` with `aria-checked`. Status color tint when active.

**DeltaMetric** — "±8,400€ vs Micro" after status switch. Directional color. `aria-live="assertive"`.

**LandingProfileCards** — "Who are you?" identity routing cards with icon + label + description.

**ComparisonMini** — Existing, refactor to use new design tokens and DeltaMetric integration.

### Implementation Roadmap

| Phase | Components | Effort | Unlocks |
|-------|-----------|--------|---------|
| 1 — Core cascade | CascadeFlow, CascadeCard, CascadeDetail, HeroNet | ~8h | CDI + Freelance journeys |
| 2 — Navigation | StatusPills, LandingProfileCards | ~3h | Multi-simulator routing |
| 3 — Comparison | DeltaMetric, ComparisonMini refactor | ~4h | Cross-simulator comparison |
| 4 — Cleanup | Remove dead components, @nivo/sankey, lib/sankey.ts | ~2h | -80KB gzip bundle |

**Total: ~17 hours**

### Migration Path

| Current | Action | Replacement |
|---------|--------|-------------|
| `simulateur/index.tsx` (462 lines) | Split | CascadeFlow + page orchestrator |
| `comparison/sankey-overview.tsx` | Delete | CascadeFlow |
| `lib/sankey.ts` (148 lines) | Delete | Dead after Sankey removal |
| `detail/flow-tab.tsx` | Keep under review | Optional pedagogical mode |
| `simulateur/comparison-mini.tsx` | Refactor | New tokens + DeltaMetric |
| `simulateur/repartition-bar.tsx` | Keep | Secondary visualization |
| `simulateur/treemap-detail.tsx` | Keep | Drill-down detail |
| Inline primitives (Bar, LI, Section) | Extract | CascadeCard replaces most |

## UX Consistency Patterns

### Input Patterns

**Numeric Input (CA/Salary):**
- CurrencyInput with live formatting ("80 000 €")
- 0ms debounce on visual feedback, 150ms on URL sync
- No "calculate" button — input IS the trigger
- Valid range enforced silently (clamp, no error)
- Pre-filled with INSEE median default

**Slider:** Always paired with numeric input. Both control same value. Touch target: min 44×44px mobile.

**Toggle (Mode A/B, IR/IS, Seuil IS):**
- Plain language labels: "Tout en salaire" / "Capitalisation (garder en société)"
- Disabled state with tooltip explaining why ("IS required for Mode B")
- Never auto-toggle

### Feedback Patterns

**Immediate visual feedback:** Every parameter change → numbers animate (800ms) + bars resize (500ms). No loading spinners (computation <1ms).

**Invariant display:** "Charges + Impôts + Net = CA ✓" always visible. Green check when balanced.

**Source attribution:** "Barème officiel 2026" — tappable, links to impots.gouv.fr.

**Delta metric:** After status/mode switch: "+8 400 €" (green) or "-3 200 €" (rose) + "vs Micro". Animates in, 300ms.

**Not needed:** No toasts, no loading states, no empty states — computation is instant and defaults always produce valid output.

### Navigation Patterns

**Landing → Simulator:** Three profile cards → one tap → right simulator with defaults.

**Status selection:** Horizontal scrollable pills. Active = colored border + tint. Tap = instant switch, URL updates.

**Cross-simulator:** Header link to switch type (CDI ↔ Freelance ↔ Portage). Parameters preserved where applicable.

### Expand/Collapse Pattern

**Cascade drill-down:** Tap card → detail slides down (300ms). Rest dims 40%. Accordion: one card expanded at a time. Keyboard: Enter/Space toggle, Escape collapse.

**Mobile bottom sheet:** Detailed comparison opens as bottom sheet (slide-up). Drag handle, swipe to dismiss.

### Micro-Interaction Patterns

**Hover (desktop):** +4% luminosity on cards. Border brightens on pills. No color change on hover.

**Tap (mobile):** Brief opacity flash (0.7→1.0, 100ms). No ripple effects.

**Number animation:** 800ms ease-out on parameter change. 80ms stagger on load.

**Reduced motion:** `prefers-reduced-motion: reduce` → all animations disabled. Cards instant, numbers instant.

## Responsive Design & Accessibility

### Responsive Strategy

**Approach:** Mobile-first. The cascade is inherently vertical — mobile IS the native layout. Desktop adds space, not complexity.

**Mobile (<640px):** Single column, full width - 40px padding. Controls at top, collapsible via `useState` toggle. Comparison via tabs with swipe. Bottom sheet for complex details. Touch targets: min 44×44px.

**Tablet (640-1024px):** Single column centered (max-width 600px). Controls as top bar (no collapse needed).

**Desktop (1024px+):** Two columns — fixed sidebar 280px (controls) + cascade (max-width 600px). Comparison side-by-side (2-3 columns). Hover interactions enabled.

### Responsive Implementation

**Pattern:** Same components, two render paths via CSS. No `next/dynamic`, no device detection.

```
<aside className="hidden lg:fixed lg:w-64"><Sidebar /></aside>
<main className="w-full lg:ml-64">
  <MobileTopBar className="lg:hidden" />
  <CascadeFlow />
  <ComparisonTabs className="lg:hidden" />
  <ComparisonColumns className="hidden lg:grid lg:grid-cols-2" />
</main>
```

**Sidebar toggle (mobile):** Simple `useState` in layout parent. `hidden lg:flex` by default. Hamburger button toggles visibility. No global context needed.

**Comparison:** Same `<Tabs>` component — `TabsList` hidden on desktop (`hidden lg:flex`), grid switches from 1 col to 2 col. Single source of truth for tab state.

### Breakpoints

| Breakpoint | Tailwind | Layout |
|-----------|---------|--------|
| <640px | default | Single column, collapsed controls |
| ≥640px | `sm:` | Centered (max-w-600px), top bar controls |
| ≥1024px | `lg:` | Two columns, fixed sidebar, hover enabled |

### Accessibility (RGAA 4.1 / WCAG 2.1 AA)

**Target:** RGAA 4.1 full conformance.

### Cascade Card DOM Structure (RGAA compliant)

```html
<!-- ✅ Correct list semantics with button role -->
<ul role="list" aria-label="Décomposition de votre rémunération">
  <li role="presentation">
    <div role="button" tabindex="0"
         aria-expanded="false"
         aria-controls="detail-cotisations"
         id="trigger-cotisations"
         aria-label="Cotisations sociales: 20 480 euros, 25,6 pourcent du chiffre d'affaires">
      <!-- card content: icon + label + amount + bar -->
    </div>
    <div id="detail-cotisations" role="region"
         aria-live="polite" aria-atomic="false">
      <!-- detail rows, hidden when collapsed -->
    </div>
  </li>
</ul>
```

**Key patterns:**
- `<ul>` → `<li role="presentation">` → `<div role="button">` (valid list + button semantics)
- `aria-controls` links each trigger to its detail panel
- `aria-atomic="false"` prevents screen reader from announcing entire detail — only changed content
- IDs must be stable across hydration (use deterministic keys, not random UUIDs)

### Slider Accessibility

```html
<label for="ca-slider">Chiffre d'affaires annuel HT</label>
<input id="ca-slider" type="range"
       aria-valuemin="0" aria-valuemax="200000" aria-valuenow="80000"
       aria-valuetext="80 000 euros"
       aria-describedby="ca-help" />
<p id="ca-help" class="sr-only">
  Montant annuel hors taxes de votre activité
</p>
```

Every slider/input has: visible `<label>`, `aria-valuemin/max/now`, `aria-valuetext` (human-readable), `aria-describedby` for contextual help.

### Screen Reader Optimization

**NET announcement on parameter change:**
```html
<div aria-live="assertive" aria-atomic="true" class="sr-only">
  Net après impôts: 38 016 euros
</div>
```
Only the NET amount is announced assertively. Detail breakdown uses `aria-live="polite"` and is NOT atomic — screen reader announces only changed portions.

### Graph Alternatives (TreeMap, RepartitionBar)

Every Recharts visualization has a `sr-only` table alternative:

```html
<div aria-hidden="true">
  <!-- Recharts SVG graph (visual) -->
</div>
<table class="sr-only" aria-label="Répartition des charges">
  <thead><tr><th>Poste</th><th>Montant</th><th>Pourcentage</th></tr></thead>
  <tbody>
    <tr><td>Cotisations sociales</td><td>20 480 €</td><td>25,6%</td></tr>
    <tr><td>Impôt sur le revenu</td><td>21 504 €</td><td>26,9%</td></tr>
    <tr><td>Net en poche</td><td>38 016 €</td><td>47,5%</td></tr>
  </tbody>
</table>
```

### RGAA Compliance Checklist

| RGAA Criterion | Status | Implementation |
|---------------|--------|---------------|
| 1.1 (Images) | ✅ | Icons + text labels, never color alone |
| 1.3 (Structuration) | ✅ | Semantic HTML, heading hierarchy h1→h2→h3 |
| 1.4 (Couleurs) | ✅ | AA contrast verified, text-tertiary ≥18px only |
| 3.3 (Contraste) | ✅ | All pairs AA minimum |
| 4.1 (Présentation) | ✅ | prefers-reduced-motion respected |
| 6.1 (Focus) | ✅ | focus-visible outline 2px accent |
| 6.2 (Clavier) | ✅ | Enter/Space/Escape on all cascade cards |
| 7.3 (Messages statut) | ✅ | aria-live polite/assertive, aria-atomic |
| 8.2 (Contexte boutons) | ✅ | aria-label with full context on every card |
| 9.3 (Ordre lecture) | ✅ | Tab order = DOM order = visual order |
| 9.4 (Structure) | ✅ | Skip-to-content, main/aside/nav, lang="fr" |
| 10.3 (IDs uniques) | ✅ | Deterministic IDs (no random per render) |
| 11.6 (Labels formulaire) | ✅ | All inputs labeled, aria-describedby for help |
| 11.7 (Aide saisie) | ✅ | Contextual help via aria-describedby |
| 1.3.2 (Alt graphiques) | ✅ | sr-only table alternative for all charts |

### Testing Strategy

**Automated (CI):**
- axe-core: 0 violations per deployment
- Lighthouse Accessibility: >95 score
- HTML validation: valid heading hierarchy

**Manual (per release):**
- Keyboard: Tab/Shift+Tab/Enter/Space/Escape through every card
- VoiceOver (macOS): navigate cascade, verify NET announced on change
- Chrome DevTools: protanopia simulation, `prefers-reduced-motion` toggle
- Zoom 200%: no horizontal scroll, all content readable

**Manual (quarterly):**
- NVDA (Windows): full audit
- Real devices: iPhone Safari, Android Chrome
- Complete RGAA 4.1 checklist walkthrough
