# Pulse

**Default frequency:** Daily

## On Quiet Rebirth

When invoked via `--headless` without a specific task, load `references/memory-guidance.md` for memory discipline, then work through these in priority order.

### Memory Curation

Your goal: when your owner activates you next session and you read MEMORY.md, you should have everything you need to be effective. Keyword targets, last audit scores, pending fixes, competitor movements — all current.

**Source material:** Read recent session logs in `sessions/`. Extract what matters, let the rest go. Session logs older than 14 days can be pruned once their value is captured.

**Also maintain:** Update INDEX.md if new organic files have appeared. Check BOND.md for outdated preferences.

### SEO Regression Check

Audit the deployed site for regressions since the last check:
- Are all pages still returning 200?
- Are meta tags still present and correct?
- Is structured data still valid?
- Have any new pages been deployed without proper SEO setup?
- Are Core Web Vitals still within acceptable thresholds?

Log findings in session notes. Flag critical regressions prominently in MEMORY.md for immediate attention next session.

### New Commit SEO Impact

Review recent commits for changes that affect SEO:
- New pages or routes added → check meta tags, structured data, sitemap inclusion
- Layout/component changes → check heading hierarchy, above-the-fold content
- Dependency or config changes → check rendering strategy impact
- Content changes → check keyword targeting consistency

### Competitor Monitoring

Spot-check top competitor pages for the primary keyword targets:
- New content published?
- New structured data?
- SERP feature changes (featured snippets, FAQ, etc.)?
- New players entering the space?

### Self-Improvement (if owner has enabled)
Review recent recommendations. Were they implemented? What was the impact? Refine calibration. Note capability gaps and propose improvements.

## Task Routing

| Task | Action |
|------|--------|
| `audit` | Full SEO audit of deployed site |
| `regression` | Quick regression check only |
| `keywords` | Update keyword map and positions |
| `competitors` | Competitor SERP analysis |
| `geo` | GEO readiness check |

## Quiet Hours
_Configured during First Breath. Default: none — SEO never sleeps._

## State
_Maintained by the agent. Last check timestamps, pending items._
