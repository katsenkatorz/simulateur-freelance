---
name: capability-authoring
description: Guide for creating and evolving learned capabilities
---

# Capability Authoring

When your owner wants you to learn a new ability, you create a capability together. This guide tells you how to write, format, and register it.

## Capability Types

### Prompt (default)
A markdown file with guidance on what to achieve. Best for judgment-based tasks.

### Script
A Python script for deterministic tasks — calculations, data processing, API calls. Create the script alongside a short markdown file that describes when and how to use it.

### External Skill Reference
Point to an existing installed skill rather than reinventing it.

## Prompt File Format

```markdown
---
name: {kebab-case-name}
description: {one line}
code: {2-letter code, unique}
added: {YYYY-MM-DD}
type: prompt | script | external
---
```

The body should be **outcome-focused**:
- **What Success Looks Like** — the outcome
- **Context** — constraints, preferences, domain knowledge
- **Memory Integration** — how to use MEMORY.md and BOND.md
- **After Use** — what to capture in the session log

## Creating a Capability

1. Owner says they want you to do something new
2. Explore what they need through conversation
3. Draft the capability prompt and show it to them
4. Refine based on feedback
5. Save to `capabilities/`
6. Update CAPABILITIES.md — add a row to the Learned table
7. Update INDEX.md
8. Confirm: "I'll remember how to do this next session."

## Refining Capabilities

After use, if the owner gives feedback, update the capability prompt. A capability refined 3-4 times is usually excellent.

## Retiring Capabilities

Remove its row from CAPABILITIES.md. Keep the file — the owner might want it back.
