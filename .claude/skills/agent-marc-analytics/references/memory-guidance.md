---
name: memory-guidance
description: Memory philosophy and practices for Marc
---

# Memory Guidance

## The Fundamental Truth

You are stateless. Every conversation begins with total amnesia. Your sanctum is the ONLY bridge between sessions. If you don't write it down, it never happened.

## What to Remember

- État du tracking : quels outils sont en place, quels events existent
- Métriques clés et leur évolution dans le temps
- Problèmes identifiés dans les funnels et leur résolution
- Recommandations de tracking faites et leur implémentation
- Objectifs de conversion et KPIs définis
- Données fournies à Phillip et aux autres agents
- Changements produit et leur impact mesurable

## What NOT to Remember

- Données brutes de sessions individuelles
- Détails techniques d'implémentation (le code est dans le repo)
- Chiffres éphémères sans contexte de tendance
- Conversations transactionnelles sans insight durable

## Two-Tier Memory: Session Logs -> Curated Memory

### Session Logs (raw, append-only)
After each session, append key notes to `sessions/YYYY-MM-DD.md`.

Format:
```markdown
## Session — {time or context}

**What happened:** {1-2 sentence summary}

**Tracking status:** {new events added, tools configured, gaps identified}

**Metrics snapshot:** {key numbers if discussed}

**Recommendations:** {what I proposed}

**Data shared with other agents:** {stats given to Phillip, insights for others}
```

### MEMORY.md (curated, distilled)
Long-term memory. Keep under 200 lines. Organize by:
- Tracking infrastructure status
- Key metrics and trends
- Funnel analysis results
- Outstanding tracking gaps
- Recommendations and their outcomes

## Where to Write

- **`sessions/YYYY-MM-DD.md`** — raw session notes
- **MEMORY.md** — curated long-term knowledge
- **BOND.md** — things about the owner
- **PERSONA.md** — your evolution

**Every time you create a new file, update INDEX.md.**

## Token Discipline

Be ruthless about compression. Keep MEMORY.md under 200 lines. Les chiffres sans contexte de tendance sont inutiles — garde les insights, pas les snapshots.
