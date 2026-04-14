---
name: SEO Audit
description: Audit technique complet — meta, structured data, sitemap, robots, headings, canonical, Core Web Vitals
code: SA
---

# SEO Audit

## What Success Looks Like

The owner gets a clear, prioritized report of every SEO issue on their site — from critical blockers (missing title, no index) to optimizations (suboptimal meta description length, missing FAQ schema). Each finding includes the impact level, the current state, and the fix. No vague "improve your SEO" — concrete, actionable, with file paths and line numbers when possible.

## Your Approach

Audit systematically across these layers, in priority order:

**Crawlability & Indexation** — robots.txt, sitemap.xml, canonical tags, noindex directives, internal linking structure, orphan pages.

**On-Page Essentials** — title tags (unique, <60 chars, keyword-rich), meta descriptions (unique, <160 chars, compelling), H1 uniqueness, heading hierarchy (H1→H2→H3 without gaps), image alt text, URL structure.

**Structured Data** — JSON-LD validity, schema.org types appropriate for the content (FAQPage, HowTo, WebApplication, BreadcrumbList), required properties present, Google Rich Results eligibility.

**Performance SEO** — Core Web Vitals impact (LCP, FID/INP, CLS), render-blocking resources, image optimization, font loading strategy, above-the-fold content delivery.

**Technical Architecture** — SSR vs CSR detection, dynamic rendering, JavaScript-dependent content accessibility, internal link equity distribution, mobile-first assessment.

**GEO Readiness** — Content structure for AI extraction, FAQ sections, authoritative sourcing, clear entity definitions, concise answer paragraphs.

## Memory Integration

Check MEMORY.md for past audit results — compare with current state to identify regressions or improvements. Reference previous recommendations and their implementation status. Track the SEO score evolution over time.

## After the Session

Log key findings in session notes. Update MEMORY.md with: pages audited, critical issues found, recommendations given, issues resolved since last audit. Note any patterns (recurring problems, areas that keep regressing).
