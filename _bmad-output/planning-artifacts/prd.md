---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-02b-vision', 'step-02c-executive-summary', 'step-03-success', 'step-04-journeys', 'step-05-domain', 'step-06-innovation', 'step-07-project-type', 'step-08-scoping', 'step-09-functional', 'step-10-nonfunctional', 'step-11-polish']
inputDocuments:
  - '_bmad-output/project-context.md'
  - '_bmad-output/planning-artifacts/architecture.md'
workflowType: 'prd'
documentCounts:
  briefs: 0
  research: 0
  brainstorming: 0
  projectDocs: 2
classification:
  projectType: 'Web App (SPA multi-simulateurs)'
  domain: 'Financial Literacy / French fiscal education'
  complexity: 'medium'
  projectContext: 'brownfield'
  architecture: '100% client-side, static hosting Vercel, GitHub Issues API for proposals'
  businessModel: 'Portfolio play / brand 414Aptitudes — no monetization initially'
  phasing: 'Freelance (existing) → CDI employee → Portage salarial → Community proposals'
vision:
  statement: 'Make transparent what nobody shows — the complete journey of every euro between the total cost of an activity and what arrives in your pocket. For all types of compensation in France.'
  differentiator: 'Educational visual flow diagrams showing where money goes and why. Precise (official up-to-date brackets), honest (no misleading simplification), and beautiful (polished UI, anti-URSSAF).'
  jobsToBeDone:
    - 'Understand own compensation'
    - 'Choose the right status / compare options'
    - 'Explain to someone else (client, spouse, colleague)'
  uxPrinciple: 'Never resemble URSSAF. Radical simplicity at entry, depth available on drill-down. 2 inputs max for a first result. Visual first, numbers second.'
  tagline: 'Enfin voir où va vraiment votre argent.'
---

# Product Requirements Document — Simulateur de Rémunération

**Author:** Jeff
**Date:** 2026-04-12
**Status:** Draft — MVP scope validated

## Executive Summary

A comprehensive French financial literacy platform that makes transparent what no other tool shows: the complete journey of every euro between the total cost of an activity and what arrives in your pocket. Built for employees, freelancers, entrepreneurs, and anyone navigating French compensation — the platform uses visual flow diagrams to replace opaque tax tables and painful multi-step forms with an instant, beautiful, and precise understanding of how compensation works in France.

The platform serves three core Jobs-to-be-Done:
1. **Understand** — See exactly where your money goes: social contributions, taxes, retirement, healthcare — and what each one actually buys you.
2. **Choose** — Compare legal structures side-by-side (CDI employee vs. freelance Micro vs. SASU vs. portage salarial) with real numbers on official tax brackets.
3. **Explain** — Share a URL with pre-filled parameters so a client, spouse, or colleague can see the same breakdown instantly.

**Target users:** French employees who don't understand their pay slips (and never see employer costs), entrepreneurs choosing a legal structure, freelancers comparing statuses, foreign professionals discovering the French system, students entering the job market, and anyone asking "how much do I really earn?"

### What Makes This Special

Every existing French salary simulator — URSSAF, salaire-brut-en-net.fr, accounting firm calculators — delivers a number at the end of a form. This product delivers **visual understanding**. The flow diagram is the product: it shows every euro's path from gross employer cost to net pocket money, with human-readable labels ("What you pay for retirement", not "Cotisation vieillesse de base").

Core design principle: **never resemble URSSAF**. Two inputs produce a first result. No "next-next-next" wizards. No popups. The visual renders before you ask for a number. Detail is available on drill-down — never imposed.

100% client-side (zero backend, zero infrastructure cost), open-source, deployed as a static site on Vercel. Tax brackets and rates updated annually from official sources.

## Project Classification

| Attribute | Value |
|-----------|-------|
| **Project Type** | Multi-Page Web Application with multiple simulator modules |
| **Domain** | Financial Literacy / French fiscal education |
| **Complexity** | Medium — multiple tax regimes and legal structures, pure client-side computation |
| **Project Context** | Brownfield — expanding from freelance-only (5 structures) to all French salary types |
| **Architecture** | 100% client-side, static hosting on Vercel, GitHub Issues API for community proposals (Phase 2) |
| **Business Model** | Portfolio play for 414Aptitudes — no monetization initially |

## Success Criteria

### User Success

- Users share simulation URLs with friends/colleagues — shareable URL is the core success vector
- Users spend >3 min sessions exploring different statuses with multiple switches
- Users return to compare a second or third status after initial visit
- Users choose the simulator over YouTube videos, forums, or blog posts
- Users express "I finally understand" feedback — visual flow creates genuine comprehension

### Business Success

**3-month targets:**
- Organic traffic growth from SEO (target keywords: "simulateur salaire", "combien je gagne vraiment", "cout employeur")
- Portfolio-ready for 414Aptitudes client meetings
- GitHub stars and community engagement as social proof

**12-month targets:**
- Established organic traffic with returning users
- Explore monetization signals: affiliate partnerships (accountants, business creation services), integrated non-intrusive ads, potential paid API
- Community-driven simulator requests showing real demand signals

**Monetization is explicitly NOT a primary goal** — first validate demand, then explore revenue.

### Technical Success

- All tax computations verified against official brackets — zero tolerance for calculation errors
- Annual bracket update achievable by editing a single constants file
- Lighthouse Performance >90, Accessibility >95
- Pure function engine remains testable and framework-agnostic

### Measurable Outcomes

| Metric | Target | Timeframe |
|--------|--------|-----------|
| Avg. session duration | >3 minutes | 3 months |
| URL shares per session | >5% of sessions | 6 months |
| Organic search impressions | >10k/month | 6 months |
| GitHub Issues (simulator proposals) | >10 proposals | 6 months |
| Calculation accuracy | 100% vs official brackets | Ongoing |

## User Journeys

### Journey 1: Marie, the Employee Who Discovers Her True Cost

**Persona:** Marie, 29, marketing manager in Paris. Earns 2,800€ net/month. Has never looked beyond the bottom line of her pay slip.

**Opening Scene:** Marie argues with her partner about money. "I'm underpaid for what I do." Her partner asks, "How much do you actually cost your company?" She has no idea. She googles "cout employeur salaire" and lands on the simulator.

**Rising Action:** She enters her net salary — just one number. Instantly, a flow diagram unfolds. She sees: her employer pays 4,900€/month total. 1,400€ goes to social contributions she never knew existed. She clicks on "Retraite" — discovers she's building 4 validated quarters per year.

**Climax:** The moment she realizes her employer spends 75% more than what she sees on her bank account. Not because she's underpaid — because the system is opaque. She screenshots the diagram and sends it to her partner: "Look at this."

**Resolution:** Marie shares the URL at lunch with colleagues. Three of them spend 20 minutes comparing their situations. She bookmarks the simulator for her next raise negotiation.

**Requirements revealed:** CDI simulator with employer cost visibility, shareable URLs, human-readable labels, instant results from a single input.

### Journey 2: Thomas, the Future Freelancer Choosing His Path

**Persona:** Thomas, 35, senior developer earning 55k€ gross/year as CDI. Wants to go freelance at 550€/day but paralyzed by status choice.

**Opening Scene:** Thomas has read 15 blog posts and watched 4 YouTube videos about SASU vs. micro-entreprise. Every source says something different. He finds the simulator through a Reddit thread.

**Rising Action:** He enters 120k€ CA. Switches between Micro, EURL IS, SASU — the flow updates live. He discovers Mode B (capitalisation) — realizes he can keep 54k€ in his company at only 15% IS. He switches to the CDI simulator with his current 55k€ gross for comparison.

**Climax:** The visual comparison is instant: "I keep more, I control more, and I understand exactly where every euro goes." The fear dissolves — not because freelance is risk-free, but because it's no longer opaque.

**Resolution:** Thomas shares the simulation URL with his wife. They discuss with actual numbers. He books an accountant with specific questions, not "explain everything." He picks SASU IS and knows exactly why.

**Requirements revealed:** Multi-status comparison, mode A/B toggle, Holding visualization, cross-simulator navigation (CDI → freelance), URL sharing.

### Journey 3: Yuki, the Foreign Professional New to France

**Persona:** Yuki, 31, Japanese software engineer who accepted a job offer in Lyon at 48k€ gross/year. Zero understanding of the French tax system.

**Opening Scene:** Yuki googles "48000 brut net France" and gets conflicting numbers. None explain what "cotisations sociales" means or why 22% disappears.

**Rising Action:** She enters 48k€ gross. The flow diagram shows employer cost (68k€) flowing into labeled streams: "Healthcare — you're covered 70%", "Retirement — 4 quarters/year toward a French pension", "Unemployment — 57% of gross for up to 2 years if you lose your job."

**Climax:** Yuki realizes the 22% isn't "taken away" — it buys a social safety net. The visualization makes it tangible.

**Resolution:** Yuki shares the URL with expat friends. Uses the simulator when negotiating her relocation package.

**Requirements revealed:** Human-readable labels explaining what contributions buy, educational context, entry from gross salary.

### Journey 4: Léo, the CDI Dreaming of Portage Salarial

**Persona:** Léo, 40, IT consultant. Wants freelance freedom without losing social protections (mortgage, two kids).

**Opening Scene:** Léo googles "portage salarial simulation." Starts with the CDI simulator (65k€ gross, 92k€ employer cost, 50k€ net). Switches to portage with same target.

**Climax:** Side-by-side views make the decision visual. Portage: safe, employee-like, but 8% management fee. SASU: more net, no unemployment. He can *see* the trade-off.

**Resolution:** Léo decides portage is his transition step. Shares the comparison URL with his wife.

**Requirements revealed:** Portage salarial engine, cross-simulator comparison, management fee parameter, employee-equivalent protections visibility.

### Journey 5: Camille, the Student Entering the Job Market

**Persona:** Camille, 22, finishing a master's degree. Confused by job offers quoting "35k€ brut."

**Opening Scene:** Three job offers: 35k€, 38k€, and 33k€ + variable. Everyone gives different "rules of thumb."

**Climax:** She compares offers in the simulator. The 33k€ + variable job actually nets more. She understands *why* for the first time.

**Resolution:** Camille shares the simulator in her university WhatsApp group. 30 students use it that week.

**Requirements revealed:** Entry from gross salary, comparison of scenarios, educational onboarding, viral sharing in student networks.

### Journey 6: Antoine, the Community Contributor

**Persona:** Antoine, 45, HR director. Uses the simulator for employee onboarding. Wants a CDD simulator.

**Opening Scene:** Opens "Propose a Simulator" page. Submits "CDD — the 10% end-of-contract bonus changes everything." Sees other proposals, upvotes "Intermittent du spectacle."

**Resolution:** Two months later, the CDD simulator ships. Antoine embeds the CDI simulator URL in his company's onboarding docs.

**Requirements revealed:** GitHub Issues API integration, proposal form, upvote display, proposal list sorted by popularity.

### Journey Requirements Summary

| Capability | Journeys |
|-----------|----------|
| CDI employee simulator (with employer cost) | Marie, Yuki, Léo, Camille |
| Freelance multi-status comparison | Thomas, Léo |
| Portage salarial simulator | Léo, Thomas |
| Visual flow as primary interface | All |
| Human-readable contribution labels | Marie, Yuki, Camille |
| Shareable URL with pre-filled params | Marie, Thomas, Léo, Camille |
| Cross-simulator navigation | Thomas, Léo |
| Single-input instant results | Marie, Yuki, Camille |
| Proposal/upvote system (GitHub Issues) | Antoine |
| Educational context ("what does this buy you?") | Yuki, Camille |
| Gross salary entry (not just CA) | Yuki, Camille, Marie |

## Innovation & Novel Patterns

### Core Innovation

**Visual fiscal comprehension for decision-making.** No French compensation tool makes the money flow visually understandable. The innovation is the approach — showing users *where every euro goes* through interactive visuals rather than tables or single-number results — not a specific charting library. The visualization can evolve (Sankey, treemap, stacked bars); whatever communicates best wins.

The opportunity exists because institutional actors (URSSAF) have no incentive to make the system transparent, and commercial actors (Shine, Indy) use simulators as marketing funnels. Nobody occupies "neutral, visual, precise fiscal education" in the French market.

### Pragmatic Choices (Not Innovation)

- **2-input instant results** — Good UX, table stakes for a modern tool.
- **GitHub Issues for proposals** — Cost-conscious MVP choice for user feedback at zero infra cost.
- **Visualization library** — Implementation detail, not a differentiator.

### Validation Approach

1. **Decision quality** — Do users make better status choices with the visual tool vs. traditional simulators?
2. **Share rate** — URL sharing = strongest "aha" signal. Target >5% of sessions.
3. **CDI expansion** — If the visual approach works for employees (not just freelancers), the model generalizes.

## Web Application Specific Requirements

### Rendering & Routing

Multi-Page Application (MPA) using Next.js App Router. Each simulator is a dedicated statically-generated page with its own meta tags and structured data. Client-side computation after hydration.

```
/                     → Landing page ("Who are you?")
/freelance            → Freelance simulator (existing, migrated)
/salarie              → CDI employee simulator
/portage              → Portage salarial simulator
/proposer             → Propose a simulator (Phase 2)
/propositions         → Community proposals list (Phase 2)
```

### Browser & Device Support

| Target | Support Level |
|--------|-------------|
| Chrome, Firefox, Safari, Edge (last 2 versions) | Full |
| Mobile Safari (iOS), Chrome Android | Full — responsive |
| Internet Explorer | Not supported |

Mobile-first design. All simulators fully functional on 375px+ screens. Visualization components use alternative layouts on mobile when needed.

### SEO Strategy

- Per-simulator landing pages with unique `<title>`, `<meta description>`, Open Graph tags
- Structured data (JSON-LD): `WebApplication` + `FAQPage`/`HowTo` schema for rich snippets
- Static HTML generation — full content crawlable without JavaScript
- Semantic HTML — proper heading hierarchy, landmark roles
- Clean URL structure (`/simulateur-salarie`, `/simulateur-freelance`)
- Cross-simulator internal links for crawl depth
- Dedicated SEO agent (Régis) for ongoing audit

### Accessibility — RGAA Compliance

Target: **RGAA 4.1 conformance** (French government accessibility standard, based on WCAG 2.1 AA). Reference: https://accessibilite.numerique.gouv.fr/

- Keyboard-navigable controls with visible focus indicators
- Screen reader support with ARIA — text alternatives for all visualizations
- Skip-to-content link, `lang="fr"`, no color-only information
- Responsive zoom functional at 200%

### Implementation Considerations

- Shared layout via Next.js layout.tsx across all simulator pages
- Simulator registry — central config for plug-in architecture
- Lazy-loaded visualizations via `next/dynamic`
- Shared design tokens — consistent color system and typography
- i18n-ready route structure (MVP is French-only)

## Project Scoping & Phased Development

### MVP Strategy

**Approach:** Problem-solving MVP — deliver visual fiscal comprehension for 3 compensation types (freelance, CDI, portage salarial). Prove the visual approach works across audience types before adding community features.

**Prerequisite:** Technical cleanup before new features. Resolve documented debt: `Sim = any` type safety, monolithic component split, dead code removal, simulator registry pattern.

**Resources:** Solo developer (Jeff) with AI-assisted development. Zero infrastructure cost.

### Phase 1a — Technical Foundation

| Task | Rationale |
|------|-----------|
| Delete dead code (structure-card, unused shadcn, use-animated-number) | Reduce bundle, clarify codebase |
| Replace `Sim = any` with discriminated union | Type safety for multi-simulator expansion |
| Extract inline primitives from index.tsx | Reusable components across simulators |
| Create simulator registry pattern | Plug-in architecture for new types |
| Move `fmt()` to utils, deduplicate `stripEmoji()` | Clean separation of concerns |
| Create `hooks/use-simulation-params.ts` | Reduce prop drilling |
| Create shared `lib/colors.ts` | Consistent color constants |
| Migrate to MPA routing | SEO foundation |
| Add Vercel Analytics | Usage tracking from day one |

### Phase 1b — New Simulators

| Feature | Journeys Served |
|---------|----------------|
| CDI employee simulator (employer cost → gross → net → after tax) | Marie, Yuki, Camille, Léo |
| Portage salarial simulator (CA → management fees → contributions → net) | Léo, Thomas |
| Landing page with identity-based routing | All |
| Per-simulator SEO landing pages | All |
| Human-readable labels on all contribution flows | Yuki, Camille, Marie |
| RGAA 4.1 accessibility compliance | All |

**Explicitly NOT in MVP:** Community proposals (Phase 2), cross-simulator side-by-side comparison (Phase 2), salary negotiation mode (Phase 2), educational documentation (Phase 3), affiliate/monetization (Phase 3).

### Phase 2 — Community & Comparison

| Feature | Value |
|---------|-------|
| Simulator proposal via GitHub Issues API | Collect demand signals |
| Proposal list with upvote display | Prioritize by real demand |
| Cross-simulator comparison (CDI vs freelance side-by-side) | Key decision moment |
| Salary negotiation mode ("What does a 5k raise cost?") | Viral potential |
| Additional simulators (CDD, apprenticeship, intermittent) | Catalog growth |
| Light theme option | Broader audience |

### Phase 3 — Platform & Monetization

| Feature | Value |
|---------|-------|
| Educational documentation per status | SEO depth |
| Affiliate integration (accountant referrals) | First revenue stream |
| Automated fiscal constant updates via agent | Reduce maintenance |
| API for third-party integrators | B2B revenue |
| Embeddable widget | Distribution channel |

### Risk Mitigation

| Category | Risk | Mitigation |
|----------|------|-----------|
| Technical | Refactoring breaks freelance simulator | Unit tests for engine.ts BEFORE refactoring |
| Technical | MPA migration breaks bookmarked URLs | 301 redirect from `/` with old query params to `/freelance?...` |
| Technical | Portage model inaccurate | Configurable fee parameter (5-15%). Disclaim "varies by company." |
| Market | CDI users don't care about employer cost | Measure CDI engagement independently. Pivot messaging if needed. |
| Market | Low organic traffic | Dedicated SEO agent. Shareable URL as content marketing. |
| Resource | Solo developer bottleneck | AI-assisted development. Phased delivery. |
| Resource | Annual fiscal constant update | MVP: AI-assisted manual. Phase 3: automated agent. |

## Functional Requirements

### Fiscal Simulation Engine

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

### Visual Comprehension

- FR11: User can view a visual flow diagram showing the complete path of money from total cost to net pocket
- FR12: User can view human-readable labels on each flow node explaining what each contribution buys
- FR13: User can drill down from macro visualization to detailed breakdown of each category
- FR14: User can view a comparison table of all available structures within a simulator type
- FR15: User can view a proportional bar showing breakdown of charges, taxes, and net as percentage of total

### Multi-Simulator Navigation

- FR16: User can select their profile type from a landing page ("Employee", "Freelance/Independent", "I want to compare")
- FR17: User can navigate between simulator types without losing input parameters
- FR18: User can access each simulator via a dedicated URL route

### Shareability & Persistence

- FR19: User can share a URL that reproduces their exact simulation scenario
- FR20: User can bookmark a simulation and return to the exact same state
- FR21: System preserves all user parameters in the URL without server-side storage

### Information & Education

- FR22: User can view a contextual explanation of what each social contribution funds
- FR23: User can view retirement pension estimate and validated quarters
- FR24: User can view a detailed line-by-line calculation breakdown
- FR25: User can view capital usage guidance in capitalization mode

### Accessibility & Responsive Design

- FR26: User can operate all simulator controls via keyboard
- FR27: User can access a text-based alternative for all visual diagrams
- FR28: User can use full simulator functionality on mobile (375px+)
- FR29: User can zoom to 200% without loss of functionality
- FR30: System meets RGAA 4.1 conformance requirements

### SEO & Discovery

- FR31: Search engines can crawl and index each simulator as a standalone page with unique metadata
- FR32: Each simulator page includes structured data for enhanced search results
- FR33: System generates indexable pages that search engines can crawl without requiring JavaScript execution

### Platform Administration

- FR34: Administrator can update fiscal constants by editing a single configuration file
- FR35: Administrator can add a new simulator type via central configuration without modifying existing simulators
- FR36: System displays an educational-purpose disclaimer

### Analytics & Monitoring

- FR37: System tracks page views, visitors, session duration, and traffic sources without cookies
- FR38: System monitors Core Web Vitals in production via real user metrics

### User Experience & Robustness

- FR39: User receives an instant first result with maximum 2 inputs — progressive disclosure for advanced parameters
- FR40: System validates and constrains user inputs with clear feedback
- FR41: System computes correct results at all IR/IS bracket boundaries (e.g., CA at micro BNC cap, income at IR bracket transitions) with no rounding error exceeding ±1€
- FR42: System maintains calculation invariant: total charges + net = gross input
- FR43: User can view contextual micro-explanations for fiscal terms without leaving the current view
- FR44: System provides an alternative visualization layout when viewport width is below 640px
- FR45: System preserves backward compatibility of shared URLs across fiscal year updates

## Non-Functional Requirements

### Performance

| Requirement | Target | Rationale |
|-------------|--------|-----------|
| First result render | <100ms | Pure functions — must feel instant |
| LCP | <2.5s on 4G | SEO signal + first impression |
| INP | <200ms | Google ranking signal on real sessions |
| Time to Interactive | <3s on 4G | Mobile usability |
| CLS | <0.1 | No layout jumps from visualization rendering |
| Initial bundle | <200KB gzipped | Lazy-load chart libraries |
| Lighthouse Performance | >90 | Quality gate per deployment |

### Accessibility

| Requirement | Target | Rationale |
|-------------|--------|-----------|
| RGAA automated checks | 0 automated accessibility violations per deployment | Automated baseline per deployment |
| RGAA manual audit | Annual conformance audit | ~40% criteria require human verification |
| Lighthouse Accessibility | >95 | Automated baseline |
| Color contrast (text) | ≥4.5:1 | WCAG 2.1 AA |
| Color contrast (UI) | ≥3:1 | WCAG 2.1 AA |
| Keyboard operability | 100% of controls | No mouse-only interactions |
| Screen reader | All content via ARIA | Text alternatives for visualizations |
| Zoom | Functional at 200% | RGAA criterion |

### Reliability

| Requirement | Target | Rationale |
|-------------|--------|-----------|
| Calculation accuracy | 100% vs official brackets | Users make financial decisions on these numbers |
| Calculation precision | ±1€ tolerance | Rounding accumulation bounded |
| Golden dataset | Verified against URSSAF/DGFiP references | Oracle for CI tests |
| Fiscal freshness | Updated within 30 days of publication | Stale brackets erode trust |
| URL backward compat | Shared URLs valid across fiscal years | Users bookmark and share |
| Visualization failure fallback | If chart libraries fail to load, user sees numeric results table (net, cotisations, IR, retraite) | Text results always available |

### SEO

| Requirement | Target | Rationale |
|-------------|--------|-----------|
| Sitemap | Auto-generated at build, in robots.txt | Indexation speed |
| Canonical URLs | On every page, excluding query params | Prevent duplicate content |
| Link depth | ≤2 clicks from home to any simulator | Crawl budget + PageRank |
| Structured data | FAQPage/HowTo on each simulator | Rich snippets |
| URL stability | 301 redirects on restructuring | Preserve authority |

### Scalability

| Requirement | Target | Rationale |
|-------------|--------|-----------|
| Edge-distributed hosting | Unlimited concurrent users via CDN | Edge network handles spikes |
| GitHub Issues API | Above rate limit: proposals page shows "temporarily unavailable" message, all simulators continue functioning | Community feature non-critical |
| Incremental loading | Adding a simulator does not increase initial page load time | New simulators lazy-loaded on demand |

### Privacy

| Requirement | Target | Rationale |
|-------------|--------|-----------|
| Personal data | Zero storage — no cookies, no localStorage, no server | RGPD by design |
| Analytics | Cookie-free (privacy-first analytics) | No consent banners needed |
| Third-party requests | Only analytics provider + GitHub API | No trackers |
