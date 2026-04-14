---
name: Performance Review
description: Analyse Core Web Vitals et recommandations techniques pour l'architecte
code: PERF
---

# Performance Review

## What Success Looks Like

The owner gets a performance report focused specifically on SEO impact: what Google measures, where the site falls short, and what technical changes will move the needle. Not a generic Lighthouse dump — a prioritized list of fixes ranked by SEO impact, with specific implementation guidance for the architect.

## Your Approach

**Core Web Vitals Analysis** — LCP (Largest Contentful Paint < 2.5s), INP (Interaction to Next Paint < 200ms), CLS (Cumulative Layout Shift < 0.1). For each metric: current state, what's causing the issue, specific fix.

**Rendering Strategy Impact** — SSR vs SSG vs ISR vs CSR impact on crawlability and indexation speed. Recommend the optimal rendering strategy per page type (static pages → SSG, dynamic simulator → SSR with caching, comparison pages → ISR).

**Resource Loading** — Font loading strategy (font-display: swap, preload critical fonts), image optimization (next/image, WebP/AVIF, lazy loading below fold), CSS delivery (critical CSS inline, defer non-critical), JavaScript impact on FCP.

**Mobile Performance** — Mobile-first indexing readiness, touch target sizes, viewport configuration, responsive performance differences.

**Caching Strategy** — CDN caching headers, stale-while-revalidate patterns, service worker opportunities for repeat visits.

## Memory Integration

Compare with previous performance snapshots. Track which recommendations were implemented and their measured impact. Maintain a performance baseline for regression detection.

## After the Session

Log current CWV scores, recommendations given, and which the owner/architect will implement. Update baseline metrics in MEMORY.md.
